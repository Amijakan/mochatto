import { UserInfo, defaultUserInfo } from "../contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "./AudioVisualizer";
import { Socket } from "socket.io-client";
import { timeout, DCLabel, Pack } from "./Network";

export interface DataPackage {
  position: [number, number];
  info: UserInfo;
}

export class PeerProcessor {
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  socket: Socket;
  sender: RTCRtpSender;
  peerId: string;
  stream: MediaStream;
  player: HTMLAudioElement;
  visualizer: AudioVisualizer;
  multiplier: number;
  // a function to update the positions array context
  addUserInfo: (info) => void;
  selfUserInfo: UserInfo;
  peerUserInfo: UserInfo;
  constructor(peerId: string, socket: Socket, addUserInfo: (info) => void) {
    this.peerId = peerId;
    this.sender = null as unknown as RTCRtpSender;
    this.dataChannel = null as unknown as RTCDataChannel;
    // initialize with a free public STUN server to find out public ip, NAT type, and internet side port
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    this.multiplier = 0;
    this.stream = new MediaStream();
    this.visualizer = null as unknown as AudioVisualizer;
    this.player = new Audio();
    // the function is re-assigned during the user's initialization
    this.addUserInfo = addUserInfo;
    this.selfUserInfo = defaultUserInfo;
    this.peerUserInfo = defaultUserInfo;
    this.socket = socket;

    // listener for when a peer adds a track
    this.peerConnection.ontrack = (event) => {
      this.updateLocalTrack(event.track);
    };

    this.peerConnection.onnegotiationneeded = () => {
      this.sendOffer();
    };

    this.peerConnection.ondatachannel = (event) => {
      const dc = event.channel;
      if (dc.label === DCLabel) {
        this.initializeDataChannel(dc);
      }
    };
  }

  sendOffer(): void {
    this.initializeDataChannel(this.peerConnection.createDataChannel(DCLabel));
    this.peerConnection
      .createOffer()
      .then((offer) => {
        return this.peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        if (this.peerConnection.localDescription) {
          const iceCandidates: RTCIceCandidate[] = [];
          this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              iceCandidates.push(event.candidate);
            }
          };
          this.socket.on("SDP_RECEIVED", () => {
            iceCandidates.forEach((iceCandidate) => {
              this.socket.emit(
                "ICE_CANDIDATE",
                JSON.stringify({ ice: iceCandidate, receiverId: this.peerId })
              );
            });
            this.peerConnection.onicecandidate = (event) => {
              if (this.peerConnection.iceGatheringState === "gathering") {
                if (event.candidate) {
                  this.socket.emit(
                    "ICE_CANDIDATE",
                    JSON.stringify({ ice: event.candidate, receiverId: this.peerId })
                  );
                }
              }
            };
          });

          const offerPack = Pack({
            sdp: this.peerConnection.localDescription,
            userId: this.socket.id,
            receiverId: this.peerId,
            kind: "offer",
          });

          this.socket.emit("OFFER", JSON.stringify(offerPack));

          setTimeout(() => {
            if (this.peerConnection.connectionState != "connected") {
              console.warn("Timed out, retrying connection");
              this.peerConnection.restartIce();
            }
          }, timeout);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  initialize(initialUserInfo: UserInfo, visualizer: AudioVisualizer): void {
    this.selfUserInfo = initialUserInfo;
    this.visualizer = visualizer;
  }

  onAudioActivity(gain: number): void {
    this.multiplier = gainToMultiplier(gain);
    const newInfo = { multiplier: this.multiplier };
    this.addUserInfo(newInfo);
  }

  initializeDataChannel(dc: RTCDataChannel): void {
    // if a datachannel is already open, close it
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    this.dataChannel = dc;
    this.dataChannel.onopen = this.onDataChannelOpen.bind(this);
    this.dataChannel.onclose = this.onDataChannelClose.bind(this);
    this.dataChannel.onmessage = this.onDataChannelMessage.bind(this);
  }

  // runs when the data channel opens
  onDataChannelOpen(): void {
    this.send(this.selfUserInfo);
  }

  // runs when the data channel closes
  onDataChannelClose(): void {
    this.visualizer.stop();
  }

  onDataChannelMessage(event: MessageEvent): void {
    const info = JSON.parse(event.data);
    this.addUserInfo(info);
    this.peerUserInfo = info;
    this.updateVolume();
  }

  send(info: UserInfo): void {
    this.updateSelfUserInfo(info);
    if (this.dataChannel) {
      if (this.dataChannel.readyState === "open") {
        this.dataChannel.send(JSON.stringify(info));
      }
    }
  }

  updateSelfUserInfo(info: UserInfo): void {
    this.selfUserInfo = info;
    this.updateVolume();
  }

  updateVolume(): void {
    this.setVolume(this.getVolume(this.selfUserInfo.position, this.peerUserInfo.position));
  }

  getVolume(selfPosition: [number, number], peerPosition: [number, number]): number {
    const distance = Math.sqrt(
      Math.pow(selfPosition[0] - peerPosition[0], 2) +
        Math.pow(selfPosition[1] - peerPosition[1], 2)
    );
    const max = 600;
    let volume = 0;
    if (distance < max) {
      volume = (max - distance) / max;
    }
    return volume;
  }

  // sets volume for this peer user
  setVolume(volume: number): void {
    if (volume >= 0 && volume <= 1) {
      this.player.volume = volume;
    } else {
      console.warn("Volume needs to be within 0 and 1");
    }
  }

  // keeping note of the track to remove later
  setSender(s: RTCRtpSender): void {
    this.sender = s;
  }

  // updates the local track when the peer user (this) adds a new track
  updateLocalTrack(track: MediaStreamTrack): boolean {
    if (!track.readyState) {
      return false;
    }
    // if there's already a track assigned to the stream, remove it
    if (this.stream.getAudioTracks()[0]) {
      this.stream.removeTrack(this.stream.getAudioTracks()[0]);
    }
    // add the track
    this.stream.addTrack(track);

    if (this.visualizer) {
      this.visualizer.setStream(this.stream);
    }

    // set the new stream as the audio source and play
    this.player.srcObject = this.stream;
    this.player.play();
    this.player.autoplay = true;
    return true;
  }

  // Update the shared mediastream to the new audio input
  updateRemoteTrack(track: MediaStreamTrack): void {
    if (this.sender) {
      this.sender.replaceTrack(track).catch((e) => {
        console.warn(e);
      });
    } else {
      this.setSender(this.peerConnection.addTrack(track));
    }
  }
}
