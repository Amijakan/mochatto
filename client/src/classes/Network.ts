import { PeerProcessor, DataPackage } from "./PeerProcessor";
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

const peerProcessors: PeerProcessor[] = [];

// send out offer to every peer users on network
export const broadcastOffer = (socket: Socket): void => {
  peerProcessors.forEach((peerProcessor) => {
    peerProcessor.initializeDataChannel(peerProcessor.peerConnection.createDataChannel(DCLabel));
    peerProcessor.peerConnection
      .createOffer()
      .then((offer) => {
        return peerProcessor.peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        peerProcessor.peerConnection.onicecandidate = (event) => {
          // needs to wait until the remote sdp is set on the receiver side
          socket.emit(
            "ICE_CANDIDATE",
            JSON.stringify({ ice: event.candidate, receiverId: peerProcessor.id })
          );
        };

        if (peerProcessor.peerConnection.localDescription) {
          const offerPack = Pack({
            sdp: peerProcessor.peerConnection.localDescription,
            userId: socket.id,
            receiverId: peerProcessor.id,
            kind: "offer",
          });

          socket.emit("OFFER", JSON.stringify(offerPack));
        }
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
export const removeFromNetwork = (id: string): void => {
  const peerProcessorIndex = peerProcessors.findIndex((peerProcessor) => peerProcessor.id === id);
  if (peerProcessors[peerProcessorIndex]) {
    peerProcessors.splice(peerProcessorIndex, 1);
  }
};

// return peerProcessor list
export const getPeerProcessors = (): PeerProcessor[] => {
  return peerProcessors;
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
