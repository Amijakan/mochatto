import React from "react";
import Avatar from "./Avatar";
import AvatarDOM from "./AvatarDOM";

function AvatarCanvas({ avatars, setAvatars }: { avatars: Avatar[], setAvatars: (any) => void }): JSX.Element {
	let offset;

	const _onMouseDown = (event) => {
		offset = [event.clientX - avatars[0].getPos()[0], event.clientY - avatars[0].getPos()[1]];
		document.addEventListener("mousemove", _onMouseMove, true);
		document.addEventListener("mouseup", _onMouseUp, true);
		event.preventDefault();
	};

	const _onMouseUp = () => {
		document.removeEventListener("mousemove", _onMouseMove, true);
		document.removeEventListener("mouseup", _onMouseUp, true);
	};

	const _onMouseMove = (event) => {
		// world coordinate
		const mousePos = [event.clientX, event.clientY];
		const newAvatar = new Avatar();
		newAvatar.setPos([mousePos[0] - offset[0], mousePos[1] - offset[1]]);
		setAvatars([newAvatar, ...avatars.slice(1, avatars.length)]);
	};

	return (
		<>
			{avatars.map((avatar, index) => {
				if (index === 0) {
					return <AvatarDOM key={index} onMouseDown={_onMouseDown} pos={avatars[index].getPos()} />;
				} else {
					return (
						<AvatarDOM
							key={index}
							onMouseDown={(e) => {
								console.log();
							}}
							pos={avatars[index].getPos()}
						/>
					);
				}
			})}
		</>
	);
}

export default AvatarCanvas;
