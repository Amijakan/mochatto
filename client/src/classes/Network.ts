import { PeerProcessor, DataPackage } from "./PeerProcessor";
import { AudioVisualizer } from "./AudioVisualizer";
import { UserInfo } from "../contexts/UserInfoContext";
import { Socket } from "socket.io-client";

export const DCLabel = "DATACHANNEL";

export const Pack = ({
  sdp,
  userId,
  receiverId,
  kind,
}: {
  sdp: RTCSessionDescription;
  userId: string;
  receiverId: string;
  kind: string;
}): {
  sdp: RTCSessionDescription;
  userId: string;
  receiverId: string;
  kind: string;
} => {
  return { sdp, userId, receiverId, kind };
};

export const timeout = 500;

export class Network {
  socket: Socket;
  peerProcessors: PeerProcessor[];
  addPosition: (id) => (position: [number, number]) => void;
  addUserInfo: (id) => (info: UserInfo) => void;
  selfUserInfo: UserInfo;
  selfPosition: [number, number];
  stream: MediaStream;
  constructor(
    socket: Socket,
    userName: string,
    addPosition: (id) => (position: [number, number]) => void,
    addUserInfo: (id) => (info: UserInfo) => void,
    selfPosition: [number, number],
    selfUserInfo: UserInfo,
    stream: MediaStream
  ) {
    this.socket = socket;
    this.peerProcessors = [];
    this.addPosition = addPosition;
    this.addUserInfo = addUserInfo;
    this.selfUserInfo = selfUserInfo;
    this.selfPosition = selfPosition;
    this.stream = stream;

    // AS A NEW COMER
    socket.emit("JOIN", userName);

    socket.on("OFFER", (dataString) => {
      const offerPack = JSON.parse(dataString);
      console.log("received offer from: " + offerPack.userId);
      const peerId = offerPack.userId;
      let peerProcessor = this.findPeerProcessorById(peerId);
      if (!peerProcessor) {
        peerProcessor = this.pushToNetwork(peerId);
      }
      const peerConnection = peerProcessor.peerConnection;
      peerConnection
        .setRemoteDescription(offerPack.sdp) // set remote description as the peerProcessor's
        .then(() => {
          socket.on("ICE_CANDIDATE", (dataString) => {
            const data = JSON.parse(dataString);
            peerConnection.addIceCandidate(data.ice).catch((e) => console.warn(e));
          });

          peerConnection
            .createAnswer()
            .then((answer) => {
              return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
              if (peerConnection.localDescription) {
                // create the answer
                const answerPack = Pack({
                  sdp: peerConnection.localDescription,
                  userId: socket.id,
                  receiverId: offerPack.userId,
                  kind: "answer",
                });

                peerConnection.onicecandidate = (event) => {
                  socket.emit(
                    "ICE_CANDIDATE",
                    JSON.stringify({ ice: event.candidate, receiverId: peerId })
                  );
                };

                socket.emit("ANSWER", JSON.stringify(answerPack));
                console.log("sending answer to: " + answerPack.receiverId);
              }
            })
            .catch((e) => {
              console.error(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });
    });

    // AS AN EXISTING USER
    socket.on("JOIN", ({ id }) => {
      if (id != socket.id) {
        const peerProcessor = this.pushToNetwork(id);
        console.log("sending offer to: " + id);
        peerProcessor.sendOffer();
      } else {
        console.log(id);
      }
    });

    socket.on("LEAVE", ({ id }) => {
      this.removeFromNetwork(id);
    });

    socket.on("ANSWER", (dataString) => {
      const answerPack = JSON.parse(dataString);
      console.log("received answer from: " + answerPack.userId);
      const peerId = answerPack.userId;
      const peerConnection = this.findPeerProcessorById(peerId).peerConnection;
      peerConnection
        .setRemoteDescription(answerPack.sdp)
        .then(() => {
          socket.on("ICE_CANDIDATE", (dataString) => {
            const data = JSON.parse(dataString);
            peerConnection.addIceCandidate(data.ice).catch((e) => console.warn(e));
          });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }

  // add peerProcessor to the network
  pushToNetwork(id: string): PeerProcessor {
    const peerProcessor = new PeerProcessor(
      id,
      this.socket,
      this.addPosition(id),
      this.addUserInfo(id)
    );
    peerProcessor.initialize(
      this.selfPosition,
      this.selfUserInfo,
      new AudioVisualizer(peerProcessor.onAudioActivity.bind(peerProcessor))
    );
    this.peerProcessors.push(peerProcessor);
    this.updateAllTracks(this.stream.getAudioTracks()[0]);
    return peerProcessor;
  }

  // remove peerProcessor to the network
  removeFromNetwork(id: string): void {
    const peerProcessorIndex = this.peerProcessors.findIndex(
      (peerProcessor) => peerProcessor.peerId === id
    );
    if (this.peerProcessors[peerProcessorIndex]) {
      this.peerProcessors.splice(peerProcessorIndex, 1);
    }
  }

  // return peerProcessor list
  getPeerProcessors(): PeerProcessor[] {
    return this.peerProcessors;
  }

  findPeerProcessorById(id: string): PeerProcessor {
    const peerProcessor = this.peerProcessors.find((pp) => pp.peerId === id);
    return peerProcessor as PeerProcessor;
  }

  // update tracks for all peer connections
  updateAllTracks(track: MediaStreamTrack): void {
    this.peerProcessors.forEach((peerProcessor) => {
      peerProcessor.updateRemoteTrack(track);
    });
  }

  broadcastData(data: Partial<DataPackage>): void {
    this.peerProcessors.forEach((peerProcessor) => {
      if (peerProcessor.dataChannel) {
        if (peerProcessor.dataChannel.readyState === "open") {
          peerProcessor.dataChannel.send(JSON.stringify(data));
        }
      }
    });
  }
}
