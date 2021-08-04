class User {
	peerConnection: any;
	sender: RTCRtpSender;
	id: string;
	constructor(id: string) {
		this.id = id;
		this.sender = null as unknown as RTCRtpSender;
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
		});
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
