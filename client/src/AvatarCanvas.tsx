import React, { useState } from "react";

function AvatarCanvas(): JSX.Element {
	const [pos, setPos] = useState([0, 0]);
	let offset;

	const _onMouseDown = (event) => {
		console.log("down");
		offset = [event.clientX - pos[0], event.clientY - pos[1]];
		document.addEventListener("mousemove", _onMouseMove, true);
		document.addEventListener("mouseup", _onMouseUp, true);
		event.preventDefault();
	};

	const _onMouseUp = (event) => {
		console.log("up");
		document.removeEventListener("mousemove", _onMouseMove, true);
		document.removeEventListener("mouseup", _onMouseUp, true);
	};

	const _onMouseMove = (event) => {
		// world coordinate
		const mousePos = [event.clientX, event.clientY];

		console.log("pos: "+pos);
		console.log("offset: "+offset);
		console.log("mousepos: "+mousePos);
		setPos([mousePos[0] - offset[0], mousePos[1] - offset[1]]);
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
					left: pos[0],
					top: pos[1],
				}}
			></div>
		</>
	);
}

export default AvatarCanvas;
