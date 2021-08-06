import Socket from "socket.io-client";
import User from "./User";

let socket = null as any;

// initialize socketio (exported)
const setSocket = (s: any, callback?: Function) => {
	socket = s;

	if (callback) {
		callback();
	}
	// emit an answer when offer is received
	socket.on("OFFER", (dataString) => {
		const sdp = JSON.parse(dataString).sdp;
		const targetId = JSON.parse(dataString).senderId;
		const user = findUserById(targetId);
		if (user) {
			console.log("emitting answer to: " + (user as User).id);
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
								senderId: socket.id,
								receiverId: targetId,
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
		}
	});

	// set remote description once answer is recieved to establish connection
	socket.on("ANSWER", (dataString) => {
		const sdp = JSON.parse(dataString).sdp;
		const senderId = JSON.parse(dataString).senderId;
		const user = findUserById(senderId);
		console.log("answer received from: " + (user as User).id);
		const peerConnection = (user as User).peerConnection;
		peerConnection.setRemoteDescription(sdp);
	});
};

const users: User[] = [];

// add user to the network (exported)
const addUser = (id: string) => {
	users.push(new User(id));
};

const getUsers = () => {
	return users;
};

const findUserById = (id: string) => {
	const user = getUsers().find((usr) => usr.id === id);
	return user;
};

// update tracks for all peer connections (exported)
const updateAllTracks = (track: MediaStreamTrack) => {
	users.forEach((user) => {
		user.updateTrack(track);
	});
};

// send out offer to every user on network (exported)
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
					senderId: socket.id,
					receiverId: user.id,
					type: "offer",
				};
				socket.emit("OFFER", JSON.stringify(data));
			})
			.catch((e) => {
				console.warn(e);
			});
	});
};

export { addUser, setSocket, updateAllTracks, sendOffer };
