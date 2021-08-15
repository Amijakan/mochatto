import React from "react";

function AvatarDOM({
	onMouseDown,
	pos,
}: {
	onMouseDown: (MouseEvent) => void;
	pos: number[];
}): JSX.Element {
	return (
		<div
			className="avatar"
			onMouseDown={onMouseDown}
			style={{
				width: "50px",
				height: "50px",
				background: "red",
				position: "absolute",
				left: pos[0],
				top: pos[1],
			}}
		></div>
	);
}

export default AvatarDOM;
