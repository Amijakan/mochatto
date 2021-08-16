import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../SocketIOContext";
import { DeviceSelector } from "../DeviceSelector";
import Avatar from "../Avatar";
import AvatarCanvas from "../AvatarCanvas";
import {
	addUser,
	removeUser,
	updateAllTracks,
	sendOffer,
	openOfferListener,
	openAnswerListener,
	getUsers,
	updateAvatarPositions,
} from "../RTCPeerConnector";
import {
	notifyAndRequestNetworkInfo,
	openJoinListener,
	openLeaveListener,
	openRequestUsersListener,
} from "./RoomPageHelper";
import PropTypes from "prop-types";

function RoomPage({ name }: { name: string }): JSX.Element {
	const [announcement, setAnnouncement] = useState("");
	const { socket } = useContext(SocketContext);
	const [avatars, setAvatars] = useState<Avatar[]>([new Avatar()]);

	// when new input is selected
	const onSelect = (stream) => {
		updateAllTracks(stream.getAudioTracks()[0]);
		sendOffer(socket);
	};

	const onJoin = ({name, id}) => {
		setAnnouncement(name + " has joined.");
		if(id != socket.id){
			addUser(id);
		}
		// add a new avatar on join
		const tempAvatars: Avatar[] = [];
		getUsers().map((user) => {
			user.onAvatarDCMessageCallback = onAvatarDCMessageCallback;
			tempAvatars.push(user.avatar);
		});
		setAvatars([avatars[0], ...(tempAvatars.slice(1, tempAvatars.length))]);
	};

	const onAvatarDCMessageCallback = () => {
		const tempAvatars: Avatar[] = [];
		getUsers().map((user) => {
			tempAvatars.push(user.avatar);
		});
		setAvatars([avatars[0], ...(tempAvatars.slice(1, tempAvatars.length))]);
	}

	// wrapper for setAvatar to be passed to AvatarCanvas
	const _setAvatars = (_avatars) => {
		setAvatars(_avatars);
	};

	useEffect(() => {
		notifyAndRequestNetworkInfo(socket, name);
		openJoinListener(socket, onJoin);
		openLeaveListener(socket, setAnnouncement, removeUser);
		openRequestUsersListener(socket, addUser);
		openOfferListener(getUsers(), socket);
		openAnswerListener(getUsers(), socket);
	}, []);

	useEffect(() => {
		if(avatars[0]){
			updateAvatarPositions(avatars[0].getPos());
		}
	}, [avatars[0]]);


	return (
		<>
			<div>Room page</div>
			<div>Input selector</div>
			<DeviceSelector onSelect={onSelect} />
			<div>{announcement}</div>
			<AvatarCanvas avatars={avatars} setAvatars={_setAvatars} />
		</>
	);
}

RoomPage.propTypes = {
	name: PropTypes.string,
};

export default RoomPage;
