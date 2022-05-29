import { UserInfo, defaultUserInfo } from "@/contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "@/classes/AudioVisualizer";
import { Socket } from "socket.io-client";
import { DCLabel, Pack } from "@/classes/Network";
import { SIOChannel } from "@/contexts/SocketIOContext"

export interface DataPackage {
  position: [number, number];
  info: UserInfo;
}

export class PeerProcessor {
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  socket: Socket;
  audioSender: RTCRtpSender;
  videoSender: RTCRtpSender;
  peerId: string;
  peerStream: MediaStream;
  audioPlayer: HTMLAudioElement;
  videoPlayer: HTMLVideoElement;
  visualizer: AudioVisualizer;
  multiplier: number;
  // a function to update the positions array context
  addUserInfo: (info) => void;
  selfUserInfo: UserInfo;
  peerUserInfo: UserInfo;
  screenShareTrigger: boolean;
  constructor(peerId: string, socket: Socket, addUserInfo: (info) => void) {
    this.peerId = peerId;
    this.audioSender = null as unknown as RTCRtpSender;
    this.videoSender = null as unknown as RTCRtpSender;
    this.dataChannel = null as unknown as RTCDataChannel;
    // initialize with a free public STUN server to find out public ip, NAT type, and internet side port
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    this.multiplier = 0;
    this.peerStream = new MediaStream();
    this.visualizer = null as unknown as AudioVisualizer;
    this.audioPlayer = new Audio();
    this.videoPlayer = null as unknown as HTMLVideoElement;
    this.screenShareTrigger = false;
    // the function is re-assigned during the user's initialization
    this.addUserInfo = addUserInfo;
    this.selfUserInfo = defaultUserInfo;
    this.peerUserInfo = defaultUserInfo;
    this.socket = socket;

    // listener for when a peer adds a track
    this.peerConnection.ontrack = (event) => {
      this.updateLocalTrack(event.track);
    };

    this.peerConnection.ondatachannel = (event) => {
      const dc = event.channel;
      if (dc.label === DCLabel) {
        this.initializeDataChannel(dc);
      }
    };
  }

  sendOffer(): void {
    if (!this.dataChannel) {
      this.initializeDataChannel(this.peerConnection.createDataChannel(DCLabel));
    }
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
          this.socket.on(SIOChannel.SDP_RECEIVED, () => {
            iceCandidates.forEach((iceCandidate) => {
              this.socket.emit(
                SIOChannel.ICE_CANDIDATE,
                JSON.stringify({ ice: iceCandidate, receiverId: this.peerId })
              );
            });
            this.peerConnection.onicecandidate = (event) => {
              if (this.peerConnection.iceGatheringState === "gathering") {
                if (event.candidate) {
                  this.socket.emit(
                    SIOChannel.ICE_CANDIDATE,
                    JSON.stringify({ ice: event.candidate, receiverId: this.peerId })
                  );
                }
              }
            };
          });

          const offerPack: Pack = {
            sdp: this.peerConnection.localDescription,
            userId: this.socket.id,
            receiverId: this.peerId,
            kind: "offer",
          };

          this.socket.emit(SIOChannel.OFFER, JSON.stringify(offerPack));
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
    // this.dataChannel.onclose = this.onDataChannelClose.bind(this);
    this.dataChannel.onmessage = this.onDataChannelMessage.bind(this);
  }

  // runs when the data channel opens
  onDataChannelOpen(): void {
    this.send(this.selfUserInfo);
  }

  onDataChannelMessage(event: MessageEvent): void {
    const info = JSON.parse(event.data);
    this.addUserInfo(info);
    if (info.isScreenSharing) {
      if (!this.screenShareTrigger) {
        this.screenShareTrigger = true;
        // If video player doesn't exist, create.
        this.videoPlayer ??= document.createElement("video");
        document.getElementById("avatar-video-" + this.peerId)?.appendChild(this.videoPlayer);
      }
    } else {
      if (this.screenShareTrigger) {
        this.screenShareTrigger = false;
        this.videoPlayer?.remove();
      }
    }
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

  close(): void {
    this.dataChannel.close();
    this.peerConnection.close();
    this.peerStream.getTracks().forEach((track) => track.stop());
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
      this.audioPlayer.volume = volume;
    } else {
      console.warn("Volume needs to be within 0 and 1");
    }
  }

  // Sets the sender for the audio track
  setAudioSender(s: RTCRtpSender): void {
    this.audioSender = s;
  }

  // Sets the sender for the video track
  setVideoSender(s: RTCRtpSender): void {
    this.videoSender = s;
  }

  // Updates the local audio track when the peer user (this) adds a new track.
  updateLocalTrack(track: MediaStreamTrack): boolean {
    if (!track.readyState) {
      return false;
    }
    switch (track.kind) {
      case "audio":
        // if there's already a track assigned to the stream, remove it
        if (this.peerStream.getAudioTracks()[0]) {
          this.peerStream.removeTrack(this.peerStream.getAudioTracks()[0]);
        }
        // add the track
        this.peerStream.addTrack(track);

        if (this.visualizer) {
          this.visualizer.setStream(this.peerStream);
        }

        // set the new stream as the audio source and play
        this.audioPlayer.srcObject = this.peerStream;
        this.audioPlayer.play();
        this.audioPlayer.autoplay = true;
        break;
      case "video":
        // if there's already a track assigned to the stream, remove it
        if (this.peerStream.getVideoTracks()[0]) {
          this.peerStream.removeTrack(this.peerStream.getVideoTracks()[0]);
        }
        // add the track
        this.peerStream.addTrack(track);

        // If video player doesn't exist, create.
        this.videoPlayer ??= document.createElement("video");
        // Set the new stream as the video source and play.
        this.videoPlayer.srcObject = this.peerStream;
        this.videoPlayer.play();
        this.videoPlayer.autoplay = true;
        break;
    }
    return true;
  }

  // Update the shared mediastream to the new audio input.
  updateRemoteTrack(track: MediaStreamTrack): void {
    switch (track.kind) {
      case "audio":
        if (this.audioSender) {
          this.audioSender.replaceTrack(track).catch((e) => {
            console.warn(e);
          });
        } else {
          this.setAudioSender(this.peerConnection.addTrack(track));
        }
        break;
      case "video":
        if (this.videoSender) {
          this.videoSender.replaceTrack(track).catch((e) => {
            console.warn(e);
          });
        } else {
          this.setVideoSender(this.peerConnection.addTrack(track));
          this.sendOffer();
        }
        break;
    }
  }
}
