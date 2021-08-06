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

	const onSocketSet = () => {
		// notify server on join
		socket.emit("JOIN",  name );
		socket.emit("REQUEST_USERS");

		socket.on("JOIN", ({ name, id }) => {
			setAnnouncement(name + " has joined.");
			if(id !== socket.id){
				addUser(id);
			}
		});

		socket.on("LEAVE", ({ name, id }) => {
			setAnnouncement(name + " has left.");
		});

		socket.on("REQUEST_USERS", (users) => {
			console.log("users requested: "+users.length);
			users.forEach((user) => {
				if(user.id !== socket.id && user.id !== undefined){
					addUser(user.id);
				}
			});
		});
	}

	useEffect(() => {
		console.log(socket.id);
		setSocket(socket, onSocketSet);
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
