import React, { useState, useEffect } from "react";
import Avatar from "./Avatar";
import AvatarDOM from "./AvatarDOM";
import { getUsers, updateAvatarPositions } from "./RTCPeerConnector";

function AvatarCanvas(): JSX.Element {
	const [avatarDOMs, setAvatarDOMs] = useState<JSX.Element[]>([]);
	const [avatars, setAvatars] = useState<Avatar[]>([]);
	let offset;

	useEffect(() => {
		avatars.push(new Avatar());
		const avatarDOM = <AvatarDOM key={0} onMouseDown={_onMouseDown} pos={avatars[0].getPos()} />;
		setAvatarDOMs([...avatarDOMs, avatarDOM]);
	}, []);

	const _onMouseDown = (event) => {
		offset = [event.clientX - avatars[0].getPos()[0], event.clientY - avatars[0].getPos()[1]];
		document.addEventListener("mousemove", _onMouseMove, true);
		document.addEventListener("mouseup", _onMouseUp, true);
		event.preventDefault();
	};

	const _onMouseUp = (event) => {
		document.removeEventListener("mousemove", _onMouseMove, true);
		document.removeEventListener("mouseup", _onMouseUp, true);
	};

	const _onMouseMove = (event) => {
		// world coordinate
		const mousePos = [event.clientX, event.clientY];
		avatars[0].setPos([mousePos[0] - offset[0], mousePos[1] - offset[1]]);
		console.log(avatars[0].getPos());
		updateAvatarPositions(avatars[0].getPos());
	};

	const addAvatar = (user) => {
		avatars.push(new Avatar());
		const index = avatars.length;
		const avatarDOM = (
			<AvatarDOM
				key={index}
				onMouseDown={(e) => {
					console.log();
				}}
				pos={avatars[index].getPos()}
			/>
		);
		setAvatarDOMs([...avatarDOMs, avatarDOM]);
	};

	return <>{avatarDOMs}</>;
}

export default AvatarCanvas;
