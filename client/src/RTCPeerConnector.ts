import Socket from "socket.io-client";
import User from "./User";

let socket = null as any;

const setSocket = (s: any) => {
	socket = s;
};

const users: User[] = [];

const connectToUser = (id: string) => {
	users.push(new User(id));
};
const peerConnection = new RTCPeerConnection({
	iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
});

const updateAllTracks = (track: MediaStreamTrack) => {
	users.forEach((user) => {
		user.updateTrack(track);
	});
};

const sendOffer = () => {
	// for each user
	users.forEach((user) => {
		// emit an offer to the server to be broadcasted
		user.peerConnection
			.createOffer()
			.then((offer) => {
				return user.peerConnection.setLocalDescription(offer);
			})
			.then(() => {
				const data = {
					sdp: user.peerConnection.localDescription,
					id: socket.id,
					type: "offer",
				};
				socket.emit("OFFER", JSON.stringify(data));
			})
			.catch((e) => {
				console.warn(e);
			});
	});
};

export { setSocket, updateAllTracks, sendOffer };
