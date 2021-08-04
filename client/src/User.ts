class User {
  peerConnection: any;
  sender: RTCRtpSender;
  id: string;
  stream: MediaStream;
  player: HTMLAudioElement;
  constructor(id: string) {
    this.id = id;
    this.sender = null as unknown as RTCRtpSender;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
    });
    this.stream = new MediaStream();
    this.player = new Audio();

    // listener for when a peer adds a track
    this.peerConnection.ontrack = (event) => {
      this.stream.addTrack(event.track);
      if (this.player) {
        // set the new stream as the audio source
        this.player.srcObject = this.stream;
      }
    };
  }

  setSender(s: RTCRtpSender) {
    this.sender = s;
  }

  updateTrack(track: MediaStreamTrack) {
    if (this.sender) {
      this.peerConnection.removeTrack(this.sender);
    }
    this.setSender(this.peerConnection.addTrack(track));
  }
}

export default User;
