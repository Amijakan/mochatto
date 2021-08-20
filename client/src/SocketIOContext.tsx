import React, { createContext, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import PropTypes from "prop-types";

export const SocketContext = createContext<{ socket: Socket; peerConnection: RTCPeerConnection }>({
	socket: null as unknown as Socket,
	peerConnection: null as unknown as RTCPeerConnection,
});

export const SocketProvider = ({ children }: { children: JSX.Element } ): JSX.Element => {
	const ENDPOINT = "http://localhost:4000/";
	const [socket, setSocket] = useState(socketIOClient(ENDPOINT));
	const [peerConnection, setPeerConnection] = useState(new RTCPeerConnection({
		iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
	}));

	return (
		<SocketContext.Provider value={{ socket, peerConnection }}>{children}</SocketContext.Provider>
	);
};

SocketProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
