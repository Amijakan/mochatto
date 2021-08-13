import React, { useState } from "react";
import Avatar from "./Avatar";
import { getUsers } from "./RTCPeerConnector";

function AvatarCanvas(): JSX.Element {
	const [pos, setPos] = useState([0, 0]);
	const [positions, setPositions] = useState([[0, 0]]);
	const avatar = new Avatar();
	let offset;

	const _onMouseDown = (event) => {
		offset = [event.clientX - pos[0], event.clientY - pos[1]];
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
	};
	return (
		<>
			<div
				className="avatar"
				onMouseDown={_onMouseDown}
				style={{
					width: "50px",
					height: "50px",
					background: "red",
					position: "absolute",
					left: positions[0][0],
					top: positions[0][1],
				}}
			></div>
		</>
	);
}

export default AvatarCanvas;
