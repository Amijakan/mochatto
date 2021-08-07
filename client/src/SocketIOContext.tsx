import React, { createContext } from "react";
import socketIOClient from "socket.io-client";
import PropTypes from "prop-types";

export const SocketContext = createContext<{ socket: any; peerConnection: any }>({
	socket: null,
	peerConnection: null,
});

export const SocketProvider = ({ children }) => {
	const ENDPOINT = "http://jimanaka.com:4000/";
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
