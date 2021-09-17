import { PeerProcessor, DataPackage } from "./PeerProcessor";
import { Socket } from "socket.io-client";

export const Pack = ({
  sdp,
  peerProcessorId,
  receiverId,
  kind,
}: {
  sdp: RTCSessionDescription;
  peerProcessorId: string;
  receiverId: string;
  kind: string;
}): {
  sdp: RTCSessionDescription;
  peerProcessorId: string;
  receiverId: string;
  kind: string;
} => {
  return { sdp, peerProcessorId, receiverId, kind };
};

const peerProcessors: PeerProcessor[] = [];

const DCLabel = "DATACHANNEL";

// send out offer to every peerProcessor on network
export const sendOffer = (socket: Socket): void => {
  // for each peerProcessor
  peerProcessors.forEach((peerProcessor) => {
    // if a datachannel is already open, close it
    if (peerProcessor.dataChannel) {
      peerProcessor.dataChannel.close();
    }

    // create data channel for the peerProcessor as the caller
    peerProcessor.initializeDataChannel(peerProcessor.peerConnection.createDataChannel(DCLabel));

    // emit an offer to the server to be broadcasted
    peerProcessor.peerConnection
      .createOffer()
      .then((offer) => {
        return peerProcessor.peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        if (peerProcessor.peerConnection.localDescription) {
          const offerPack = Pack({
            sdp: peerProcessor.peerConnection.localDescription,
            peerProcessorId: socket.id,
            receiverId: peerProcessor.id,
            kind: "offer",
          });

          peerProcessor.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit(
                "ICE_CANDIDATE",
                JSON.stringify({ ice: event.candidate, receiverId: peerProcessor.id })
              );
            }
          };

          socket.emit("OFFER", JSON.stringify(offerPack));
        }
      })
      .catch((e) => {
        console.error(e);
      });
  });
};

// open socketio listener for receiving WebRTC offers and sending answer
export const openOfferListener = (socket: Socket): void => {
  // emit an answer when offer is received
  socket.on("OFFER", (dataString) => {
    const offerPack = JSON.parse(dataString);
    const peerProcessor = findPeerProcessorById(offerPack.peerProcessorId) as PeerProcessor;
    if (peerProcessor) {
      // set the local datachannel and event handlers on connect
      peerProcessor.peerConnection.ondatachannel = (event) => {
        const dc = event.channel;
        if (dc.label === DCLabel) {
          peerProcessor.initializeDataChannel(dc);
        }
      };
      // identify and use RTCPeerConnection object for the peerProcessor peerProcessor
      const peerConnection = peerProcessor.peerConnection;

      peerConnection
        .setRemoteDescription(offerPack.sdp) // set remote description as the peerProcessor's
        .then(() => {
          socket.on("ICE_CANDIDATE", (dataString) => {
            const data = JSON.parse(dataString);
            peerConnection.addIceCandidate(data.ice);
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
                  peerProcessorId: socket.id,
                  receiverId: offerPack.peerProcessorId,
                  kind: "answer",
                });

                peerConnection.onicecandidate = (event) => {
                  if (event.candidate) {
                    socket.emit(
                      "ICE_CANDIDATE",
                      JSON.stringify({ ice: event.candidate, receiverId: peerProcessor.id })
                    );
                  }
                };

                socket.emit("ANSWER", JSON.stringify(answerPack));
              }
            })
            .catch((e) => {
              console.error(e);
            });
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      console.error("Could not emit answer. Sender was not found on peerProcessors list.");
    }
  });
};

// open socketio listener for receiving WebRTC answers
export const openAnswerListener = (socket: Socket): void => {
  // set remote description once answer is recieved to establish connection
  socket.on("ANSWER", (dataString) => {
    const answerPack = JSON.parse(dataString);
    const peerProcessor = findPeerProcessorById(answerPack.peerProcessorId);
    const peerConnection = (peerProcessor as PeerProcessor).peerConnection;
    peerConnection
      .setRemoteDescription(answerPack.sdp)
      .then(() => {
        socket.on("ICE_CANDIDATE", (dataString) => {
          const data = JSON.parse(dataString);
          peerConnection.addIceCandidate(data.ice);
        });
      })
      .catch((e) => {
        console.error(e);
      });
  });
};

// add peerProcessor to the network
export const pushToNetwork = (peerProcessor: PeerProcessor): void => {
  peerProcessors.push(peerProcessor);
};

// remove peerProcessor to the network
export const removeUserFromNetwork = (id: string): void => {
  const peerProcessorIndex = peerProcessors.findIndex((peerProcessor) => peerProcessor.id === id);
  if (peerProcessors[peerProcessorIndex]) {
    peerProcessors.splice(peerProcessorIndex, 1);
  }
};

// return peerProcessor list
export const getPeerProcessors = (): PeerProcessor[] => {
  return peerProcessors;
};

// find peerProcessor by its socketid
const findPeerProcessorById = (id: string): PeerProcessor => {
  const peerProcessor = peerProcessors.find((pp) => pp.id === id);
  return peerProcessor as PeerProcessor;
};

// update tracks for all peer connections
export const updateAllTracks = (track: MediaStreamTrack): void => {
  peerProcessors.forEach((peerProcessor) => {
    peerProcessor.updateRemoteTrack(track);
  });
};

export const broadcastData = (data: Partial<DataPackage>): void => {
  peerProcessors.forEach((peerProcessor) => {
    if (peerProcessor.dataChannel) {
      if (peerProcessor.dataChannel.readyState === "open") {
        peerProcessor.dataChannel.send(JSON.stringify(data));
      }
    }
  });
};
