import React, { useState, useEffect } from "react";

function AvatarCanvas(): JSX.Element {
	const [pos, setPos] = useState([0, 0]);
	const [offset, setOffset] = useState([0, 0]);
	const [isDragging, setIsDragging] = useState(false);

	const container = document.querySelector(".avatar-container") ?? document.createElement("div");
	const avatar = document.querySelector(".avatar") ?? document.createElement("div");

	const _onMouseDown = (event) => {
		setOffset([event.clientX - pos[0], event.clientY - pos[1]]);
		setIsDragging(true);
	};

	const _onMouseUp = (event) => {
		setOffset([0, 0]);
		setIsDragging(false);
	};
	const _onMouseMove = (event) => {
		// world coordinate
		const mousePos = [event.clientX, event.clientY];

		// viewport coordinates
		const contRect = container.getBoundingClientRect();
		const limits = [0, 0, contRect.width, contRect.height];

		const avatarRect = avatar.getBoundingClientRect();

		if (isDragging) {
			if(mousePos[0]-offset[0] >= limits[0]){
				if(mousePos[0]-offset[0]+avatarRect.width <= limits[2]){
					if(mousePos[1]-offset[1] >= limits[1]){
						if(mousePos[1]-offset[1]+avatarRect.height <= limits[3]){
							setPos([mousePos[0] - offset[0], mousePos[1]-offset[1]]);
						}
						else{
							setPos([pos[0],limits[3]-avatarRect.height]);
						}
					}
					else{
						setPos([pos[0],limits[1]]);
					}
				}
				else{
					setPos([limits[2]-avatarRect.width, pos[1]]);
				}
			}
			else{
				setPos([limits[0], pos[1]]);
			}
		}
	};
	return (
		<>
			<div
				className="avatar-container"
				onMouseUp={_onMouseUp}
				onMouseMove={_onMouseMove}
				style={{
					background: "black",
					position: "absolute",
					left: "20%",
					top: "20%",
					width: "60%",
					height: "60%",
					padding: "0",
					margin: "0",
				}}
			>
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
			</div>
		</>
	);
}

export default AvatarCanvas;
