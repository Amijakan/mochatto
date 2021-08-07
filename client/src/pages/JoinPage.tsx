import React, { useContext } from "react";
import { SocketContext } from "../SocketIOContext";
import PropTypes from "prop-types";

const JoinPage = ({ name, setName, setJoined }) => {
	const { socket } = useContext(SocketContext);
	const onJoin = () => {
		if (socket) {
			setJoined(true);
		}
	};

	return (
		<>
			<div>
				<label>
					Name:
					<input
						type="text"
						name="name"
						onChange={(e) => {
							setName(e.target.value);
						}}
					/>
				</label>
			</div>
			<div>
				<button onClick={() => onJoin()}>Join</button>
			</div>
		</>
	);
};

JoinPage.propTypes = {
	name: String,
	setName: Function,
	setJoined: Function,
};

export default JoinPage;
