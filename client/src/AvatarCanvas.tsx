import React, { useState, useEffect } from "react";

function AvatarCanvas(): JSX.Element {
	const [pos, setPos] = useState([0, 0]);
	const [offset, setOffset] = useState([0, 0]);
	const [isDragging, setIsDragging] = useState(false);

	const _onMouseDown = (event) => {
		setOffset([event.screenX - pos[0], event.screenY - pos[1]]);
		setIsDragging(true);
	};

	const _onMouseUp = (event) => {
		setOffset([0, 0]);
		setIsDragging(false);
	};
	const _onMouseMove = (event) => {
		const sx = event.screenX;
		const sy = event.screenY;
		if (isDragging) {
			setPos([sx - offset[0], sy - offset[1]]);
		}
	};
	return (
		<>
			<div
				onMouseUp={_onMouseUp}
				onMouseMove={_onMouseMove}
				style={{
					background: "black",
					position: "absolute",
					left: "0",
					width: "100%",
					height: "70%",
				}}
			>
				<div
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
			</div>
		</>
	);
}

export default AvatarCanvas;
