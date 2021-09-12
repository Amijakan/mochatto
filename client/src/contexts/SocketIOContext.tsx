import React, { createContext, useState, useEffect } from "react";
import socketIOClient, { Socket } from "socket.io-client";
import PropTypes from "prop-types";

export const SocketContext = createContext<{ socket: Socket }>({
  socket: null as unknown as Socket,
});

export const SocketProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const ENDPOINT = "http://localhost:4000/";
  const [socket, setSocket] = useState(null as unknown as Socket);

  useEffect(() => {
    setSocket(socketIOClient(ENDPOINT));
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
