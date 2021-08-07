import Socket from "socket.io-client";
import User from "./User";

const users: User[] = [];

export const openOfferListener = (users: User[], socket) => {
	// emit an answer when offer is received
	socket.on("OFFER", (dataString) => {
		const sdp = JSON.parse(dataString).sdp;
		const targetId = JSON.parse(dataString).senderId;
		const user = findUserById(users, targetId);
		if (user) {
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
};

export const openAnswerListener = (users: User[], socket) => {
	// set remote description once answer is recieved to establish connection
	socket.on("ANSWER", (dataString) => {
		const sdp = JSON.parse(dataString).sdp;
		const senderId = JSON.parse(dataString).senderId;
		const user = findUserById(users, senderId);
		const peerConnection = (user as User).peerConnection;
		peerConnection.setRemoteDescription(sdp);
	});
};

// add user to the network (exported)
export const addUser = (id: string) => {
	users.push(new User(id));
};

export const getUsers = () => {
	return users;
};

export const findUserById = (users: User[], id: string) => {
	const user = users.find((usr) => usr.id === id);
	return user;
};

// update tracks for all peer connections (exported)
export const updateAllTracks = (track: MediaStreamTrack) => {
	users.forEach((user) => {
		user.updateRemoteTrack(track);
	});
};

// send out offer to every user on network (exported)
export const sendOffer = (socket) => {
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
