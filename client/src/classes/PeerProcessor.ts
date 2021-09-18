import { UserInfo, defaultUserInfo } from "../contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "./AudioVisualizer";
import { Socket } from "socket.io-client";
import { DCLabel, Pack } from "./Network";

export interface DataPackage {
  position: [number, number];
  info: UserInfo;
}

export class PeerProcessor {
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  socket: Socket;
  sender: RTCRtpSender;
  id: string;
  stream: MediaStream;
  player: HTMLAudioElement;
  selfPosition: [number, number];
  peerPosition: [number, number];
  visualizer: AudioVisualizer;
  multiplier: number;
  // a function to update the positions array context
  addPosition: (positionString) => void;
  addUserInfo: (info) => void;
  userInfo: UserInfo;
  constructor(
    id: string,
    socket: Socket,
    addPosition: (position) => void,
    addUserInfo: (info) => void
  ) {
    this.id = id;
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
    this.selfPosition = [0, 0];
    this.peerPosition = [0, 0];
    // the function is re-assigned during the user's initialization
    this.addPosition = addPosition;
    this.addUserInfo = addUserInfo;
    this.userInfo = defaultUserInfo;
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

    // emit an answer when offer is received
    socket.on("OFFER", (dataString) => {
      const offerPack = JSON.parse(dataString);
      this.peerConnection
        .setRemoteDescription(offerPack.sdp) // set remote description as the peerProcessor's
        .then(() => {
          socket.on("ICE_CANDIDATE", (dataString) => {
            const data = JSON.parse(dataString);
            this.peerConnection.addIceCandidate(data.ice).catch((e) => console.warn(e));
          });

          this.peerConnection
            .createAnswer()
            .then((answer) => {
              return this.peerConnection.setLocalDescription(answer);
            })
            .then(() => {
              this.peerConnection.onicecandidate = (event) => {
                // needs to wait until the remote sdp is set on the receiver side
                socket.emit(
                  "ICE_CANDIDATE",
                  JSON.stringify({ ice: event.candidate, receiverId: this.id })
                );
              };

              if (this.peerConnection.localDescription) {
                // create the answer
                const answerPack = Pack({
                  sdp: this.peerConnection.localDescription,
                  userId: socket.id,
                  receiverId: offerPack.userId,
                  kind: "answer",
                });

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
    });

    socket.on("ANSWER", (dataString) => {
      const answerPack = JSON.parse(dataString);
      this.peerConnection
        .setRemoteDescription(answerPack.sdp)
        .then(() => {
          socket.on("ICE_CANDIDATE", (dataString) => {
            const data = JSON.parse(dataString);
            this.peerConnection.addIceCandidate(data.ice).catch((e) => console.warn(e));
          });
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }

  initialize(
    initialSelfPosition: [number, number],
    initialUserInfo: UserInfo,
    visualizer: AudioVisualizer
  ): void {
    this.selfPosition = initialSelfPosition;
    this.userInfo = initialUserInfo;
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
    const data = { position: this.selfPosition, info: this.userInfo };
    this.dataChannel.send(JSON.stringify(data));
  }

  // runs when the data channel closes
  onDataChannelClose(): void {
    this.visualizer.stop();
  }

  onDataChannelMessage(event: MessageEvent): void {
    const data = JSON.parse(event.data);
    if (data.info) {
      this.addUserInfo(data.info);
    }
    if (data.position) {
      this.peerPosition = data.position;
      this.updateVolume();
      this.addPosition(data.position);
    }
  }

  setSelfPosition(position: [number, number]): void {
    this.selfPosition = position;
    this.updateVolume();
  }

  updateVolume(): void {
    this.setVolume(this.getVolume(this.selfPosition, this.peerPosition));
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
