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
export const timeout = 500;

// send out offer to every peer users on network
export const broadcastOffer = (socket: Socket): void => {
  peerProcessors.forEach((peerProcessor) => {
    peerProcessor.sendOffer();
  });
};

// add peerProcessor to the network
export const pushToNetwork = (peerProcessor: PeerProcessor): void => {
  peerProcessors.push(peerProcessor);
};

// remove peerProcessor to the network
export const removeFromNetwork = (id: string): void => {
  const peerProcessorIndex = peerProcessors.findIndex(
    (peerProcessor) => peerProcessor.peerId === id
  );
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
