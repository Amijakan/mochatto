import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../SocketIOContext";
import { DeviceSelector } from "../DeviceSelector";
import { addUser, setSocket, updateAllTracks, sendOffer } from "../RTCPeerConnector";

function RoomPage({ name }) {
	const [announcement, setAnnouncement] = useState("");
	const { socket } = useContext(SocketContext);

	// when new input is selected
	const onSelect = ({ selectedInput, inputOptions, stream }) => {
		updateAllTracks(stream.getAudioTracks()[0]);
		sendOffer();
	};

	useEffect(() => {
		setSocket(socket);

		// notify server on join
		socket.emit("NEW_USER", { id: socket.id, name });
		socket.emit("REQUEST_USERS");

		socket.on("NEW_USER", ({ name, id }) => {
			setAnnouncement(name + " has joined.");
			addUser(id);
		});

		socket.on("REQUEST_USERS", (users) => {
			users.forEach((user) => {
				addUser(user.id);
			});
		});
	}, []);

	return (
		<>
			<div>Room page</div>
			<div>Input selector</div>
			<DeviceSelector onSelect={onSelect} />
			<div>{announcement}</div>
		</>
	);
}

export default RoomPage;
