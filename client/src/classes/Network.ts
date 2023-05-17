import _ from "lodash"
import { PeerProcessor } from "@/classes/PeerProcessor";
import { AudioVisualizer } from "@/classes/AudioVisualizer";
import { UserInfo } from "@/contexts/UserInfoContext";
import { SIOChannel } from "@/shared/socketIO"
import { Socket } from "socket.io-client";

export const DCLabel = "DATACHANNEL";

export interface Pack {
  sdp: RTCSessionDescription;
  userId: string;
  receiverId: string;
  kind: string;
}

export class Network {
  socket: Socket;
  peerProcessors: PeerProcessor[];
  addUserInfo: (id: string) => (info: Partial<UserInfo>) => void;
  selfUserInfo: UserInfo;
  selfStream: MediaStream;
  constructor(
    socket: Socket,
    userName: string,
    addUserInfo: (id: string) => (info: Partial<UserInfo>) => void,
    selfUserInfo: UserInfo,
    selfStream: MediaStream
  ) {
    this.socket = socket;
    this.peerProcessors = [];
    this.addUserInfo = addUserInfo;
    this.selfUserInfo = selfUserInfo;
    this.selfStream = selfStream;

    // AS A NEW COMER
    socket.emit(SIOChannel.JOIN, userName);

    socket.on(SIOChannel.OFFER, (dataString: string) => {
      const offerPack = JSON.parse(dataString);
      const peerId = offerPack.userId;
      let peerProcessor = this.findPeerProcessorById(peerId);
      if (!peerProcessor) {
        peerProcessor = this.pushToNetwork(peerId);
      }
      const peerConnection = peerProcessor.peerConnection;
      peerConnection
        .setRemoteDescription(offerPack.sdp) // set remote description as the peerProcessor's
        .then(() => {
          socket.emit(SIOChannel.SDP_RECEIVED, peerId);
          socket.on(SIOChannel.ICE_CANDIDATE, (dataString: string) => {
            const data = JSON.parse(dataString);
            if (peerConnection.signalingState != "closed") {
              peerConnection.addIceCandidate(data.ice).catch((e) => console.warn(e));
            }
          });

          peerConnection
            .createAnswer()
            .then((answer) => {
              return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
              if (peerConnection.localDescription) {
                const iceCandidates: RTCIceCandidate[] = [];
                peerConnection.onicecandidate = (event) => {
                  if (event.candidate) {
                    iceCandidates.push(event.candidate);
                  }
                };
                socket.on(SIOChannel.SDP_RECEIVED, () => {
                  iceCandidates.forEach((iceCandidate) => {
                    socket.emit(
                      SIOChannel.ICE_CANDIDATE,
                      JSON.stringify({ ice: iceCandidate, receiverId: peerId })
                    );
                  });
                  peerConnection.onicecandidate = (event) => {
                    if (peerConnection.iceGatheringState === "gathering") {
                      if (event.candidate) {
                        socket.emit(
                          SIOChannel.ICE_CANDIDATE,
                          JSON.stringify({ ice: event.candidate, receiverId: peerId })
                        );
                      }
                    }
                  };
                });
                // create the answer
                const answerPack: Pack = {
                  sdp: peerConnection.localDescription,
                  userId: socket.id,
                  receiverId: offerPack.userId,
                  kind: "answer",
                };

                socket.emit(SIOChannel.ANSWER, JSON.stringify(answerPack));
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
    socket.on(SIOChannel.JOIN, ({ id }) => {
      if (id != socket.id) {
        const peerProcessor = this.pushToNetwork(id);
        peerProcessor.sendOffer();
      }
    });

    socket.on(SIOChannel.LEAVE, ({ id }) => {
      this.removeFromNetwork(id);
    });

    socket.on(SIOChannel.ANSWER, (dataString: string) => {
      const answerPack = JSON.parse(dataString);
      const peerId = answerPack.userId;
      const peerConnection = this.findPeerProcessorById(peerId).peerConnection;
      peerConnection
        .setRemoteDescription(answerPack.sdp)
        .then(() => {
          socket.emit(SIOChannel.SDP_RECEIVED, peerId);
          socket.on(SIOChannel.ICE_CANDIDATE, (dataString: string) => {
            const data = JSON.parse(dataString);
            if (peerConnection.signalingState != "closed") {
              peerConnection.addIceCandidate(data.ice).catch((e) => console.warn(e));
            }
          });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }

  replaceStream(stream: MediaStream) {
    this.selfStream = stream;
  }

  // add peerProcessor to the network
  pushToNetwork(id: string): PeerProcessor {
    const peerProcessor = new PeerProcessor(id, this.socket, this.addUserInfo(id));
    peerProcessor.initialize(
      this.selfUserInfo,
      new AudioVisualizer(this.addUserInfo(id))
    );
    this.peerProcessors.push(peerProcessor);

    // If there are streams that need to be sent, send them to the peer.
    this.updateAllTracks(this.selfStream?.getAudioTracks()[0]);

    this.updateAllTracks(_.last(this.selfStream.getVideoTracks()) as MediaStreamTrack);
    // Send the user info to the peer as well.
    this.broadcastInfo(this.selfUserInfo);
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

  setDeaf(deaf: boolean): void {
    this.peerProcessors.forEach((peerProcessor) => {
      peerProcessor.audioPlayer.muted = deaf;
    });
  }

  // update tracks for all peer connections
  updateAllTracks(track: MediaStreamTrack): void {
    if (track) {
      this.peerProcessors.forEach((peerProcessor) => {
        peerProcessor.updateRemoteTrack(track);
      });
    }
  }

  updateInfo(info: UserInfo): void {
    this.selfUserInfo = info;
    this.broadcastInfo(info);
  }

  broadcastInfo(info: UserInfo): void {
    this.peerProcessors.forEach((peerProcessor) => {
      peerProcessor.send(info);
    });
  }

  close(): void {
    this.peerProcessors.forEach((peerProcessor) => {
      peerProcessor.close();
    });
  }
}
