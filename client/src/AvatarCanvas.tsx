import React, { useState } from "react";
import Avatar from "./Avatar";
import AvatarDOM from "./AvatarDOM";
import { getUsers, updateAvatarPositions } from "./RTCPeerConnector";

function AvatarCanvas(): JSX.Element {
	const [positions, setPositions] = useState([[0, 0]]);
	const avatar = new Avatar();
	let offset;

	const _onMouseDown = (event) => {
		offset = [event.clientX - positions[0][0], event.clientY - positions[0][1]];
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
		avatar.setPos([mousePos[0] - offset[0], mousePos[1] - offset[1]]);
		setPositions([avatar.getPos()]);
		updateAvatarPositions(avatar.getPos());
	};

	const addAvatar = (user) => {
		console.log(user);
	};
	return (
		<>
			<AvatarDOM onMouseDown={_onMouseDown} pos={positions[0]} />
		</>
	);
}

export default AvatarCanvas;
