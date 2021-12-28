import React, { createContext, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import PropTypes from "prop-types";

export const SocketContext = createContext<{ socket: Socket }>({
  socket: null as unknown as Socket,
});

export const SocketProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [socket, setSocket] = useState(null as unknown as Socket);

  useEffect(() => {
    const pathname = window.location.pathname;
    const ENDPOINT = (import.meta.env.VITE_SERVER_URL || "http://localhost:4000") + pathname;
    setSocket(io(ENDPOINT));
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
