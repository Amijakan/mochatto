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
			if (this.stream.getAudioTracks()[0]) {
				this.stream.removeTrack(this.stream.getAudioTracks()[0]);
			}
			console.log(this.stream.getAudioTracks());
			this.stream.addTrack(event.track);
			console.log(this.stream.getAudioTracks());
			// set the new stream as the audio source
			this.player.srcObject = this.stream;
			console.log(this.stream);
			this.player.play();
			this.player.autoplay = true;
		};
	}

	setSender(s: RTCRtpSender) {
		this.sender = s;
	}

	updateTrack(track: MediaStreamTrack) {
		if (this.sender) {
			this.peerConnection.removeTrack(this.sender);
		}
		console.log(track);
		this.setSender(this.peerConnection.addTrack(track));
	}
}

export default User;
