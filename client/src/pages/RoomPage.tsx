import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../SocketIOContext";
import { DeviceSelector } from "../DeviceSelector";
import { addUser, updateAllTracks, sendOffer } from "../RTCPeerConnector";
import {
	notifyAndRequestNetworkInfo,
	openJoinListener,
	openLeaveListener,
	openRequestUsersListener,
} from "./RoomPageHelper";
import PropTypes from "prop-types";

function RoomPage(): JSX.Element {
	const [announcement, setAnnouncement] = useState("");
	const { socket } = useContext(SocketContext);

	// when new input is selected
	const onSelect = (stream) => {
		updateAllTracks(stream.getAudioTracks()[0]);
		sendOffer(socket);
	};

	useEffect(() => {
		notifyAndRequestNetworkInfo(socket);
		openJoinListener(socket, addUser, setAnnouncement);
		openLeaveListener(socket, setAnnouncement);
		openRequestUsersListener(socket, addUser);
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

RoomPage.propTypes = {
	name: PropTypes.string,
};

export default RoomPage;
