import Avatar from "./Avatar";

class User {
	peerConnection: RTCPeerConnection;
	avatarDC: RTCDataChannel;
	sender: RTCRtpSender;
	id: string;
	stream: MediaStream;
	player: HTMLAudioElement;
	avatar: Avatar;
	constructor(id: string) {
		this.id = id;
		this.sender = null as unknown as RTCRtpSender;
		this.avatarDC = null as unknown as RTCDataChannel;
		// initialize with a free public STUN server to find out public ip, NAT type, and internet side port
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
		});
		this.stream = new MediaStream();
		this.player = new Audio();
		this.avatar = new Avatar();

		// listener for when a peer adds a track
		this.peerConnection.ontrack = (event) => {
			this.updateLocalTrack(event.track);
		};
	}

	onAvatarDCOpen(): void {
		console.log("dc open");
	}
	onAvatarDCClose(): void {
		console.log("dc close");
	}
	onAvatarDCMessage(event): void {
		console.log("dc message: " + JSON.parse(event.data));
		this.avatar.setPos(JSON.parse(event.data));
	}

	setSender(s: RTCRtpSender): void {
		this.sender = s;
	}

	updateLocalTrack(track: MediaStreamTrack): boolean {
		if (!track.readyState) {
			return false;
		}
		// if there's already a track assigned to the stream, remove it
		if (this.stream.getAudioTracks()[0]) {
			this.stream.removeTrack(this.stream.getAudioTracks()[0]);
		}
		this.stream.addTrack(track);
		// set the new stream as the audio source
		this.player.srcObject = this.stream;
		this.player.play();
		this.player.autoplay = true;
		return true;
	}

	updateRemoteTrack(track: MediaStreamTrack): void {
		if (this.sender) {
			this.peerConnection.removeTrack(this.sender);
		}
		this.setSender(this.peerConnection.addTrack(track));
	}
}

export default User;
