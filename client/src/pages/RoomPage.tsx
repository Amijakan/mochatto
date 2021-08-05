import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../SocketIOContext";
import { DeviceSelector } from "../DeviceSelector";
import { addUser, setSocket, updateAllTracks, sendOffer } from "../RTCPeerConnector";

function RoomPage({ name }) {
	const [announcement, setAnnouncement] = useState("");
	const { socket } = useContext(SocketContext);

	// when new input is selected
	const onSelect = ({ selectedInput, inputOptions, stream }) => {};

	socket.on("NEW_USER", ({ name, id }) => {
		setAnnouncement(name + " has joined.");
		addUser(id);
	});

	return (
		<>
			<div>Room page</div>
			<audio autoPlay></audio>
			<div>Input selector</div>
			<DeviceSelector onSelect={onSelect} />
			<div>{announcement}</div>
		</>
	);
}

export default RoomPage;
