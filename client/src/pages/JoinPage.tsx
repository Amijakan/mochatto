import React, { useContext } from "react";
import { SocketContext } from "../SocketIOContext";
import PropTypes from "prop-types";

const JoinPage = ({ setName, setJoined }): JSX.Element => { // eslint-disable-line
	const { socket } = useContext(SocketContext);
	const onJoinClicked = () => {
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
				<button onClick={() => onJoinClicked()}>Join</button>
			</div>
		</>
	);
};

JoinPage.propTypes = {
	name: PropTypes.string,
	setName: PropTypes.func,
	setJoined: PropTypes.func,
};

export default JoinPage;
