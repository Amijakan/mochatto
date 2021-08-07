import React, { createContext } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import PropTypes from "prop-types";

export const SocketContext = createContext<{ socket: Socket; peerConnection: RTCPeerConnection }>({
	socket: null as unknown as Socket,
	peerConnection: null as unknown as RTCPeerConnection,
});

export const SocketProvider = ({ children }): JSX.Element => {
	//eslint-disable-line
	const ENDPOINT = "http://localhost:4000/";
	const socket = socketIOClient(ENDPOINT);
	const peerConnection = new RTCPeerConnection({
		iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
	});

	return (
		<SocketContext.Provider value={{ socket, peerConnection }}>{children}</SocketContext.Provider>
	);
};

SocketProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
