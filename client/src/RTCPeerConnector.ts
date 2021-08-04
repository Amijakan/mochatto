import Socket from "socket.io-client";
import User from "./User";

let socket = null as any;

const setSocket = (s: any) => {
	socket = s;
};

const users: User[] = [];

const addUser = (id: string) => {
	users.push(new User(id));
};

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

// emit an answer when offer is received
socket.on("OFFER", (dataString) => {
	const sdp = JSON.parse(dataString).sdp;
	const target = JSON.parse(dataString).id;
	const user = users.find((user) => {
		user.id = target;
	});
	const peerConnection = (user as User).peerConnection;
	peerConnection
		.setRemoteDescription(new RTCSessionDescription(sdp)) // establish connection with the sender
		.then(() => {
			peerConnection
				.createAnswer()
				.then((answer) => {
					return peerConnection.setLocalDescription(answer);
				})
				.then(() => {
					const data = {
						sdp: peerConnection.localDescription,
						id: socket.id,
						target: target,
						type: "answer",
					};
					socket.emit("ANSWER", JSON.stringify(data));
				})
				.catch((e) => {
					console.warn(e);
				});
		})
		.catch((e) => {
			console.warn(e);
		});
});

export { setSocket, updateAllTracks, sendOffer };
