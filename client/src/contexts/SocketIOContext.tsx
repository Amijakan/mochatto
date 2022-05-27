import React, { createContext, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import PropTypes from "prop-types";

const stripTrailingSlash = (str: string) => str.replace(/\/$/, '')

export enum SIOChannel {
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  DISCONNECT = "DISCONNECT",
  SDP_RECEIVED = "SDP_RECEIVED",
  ICE_CANDIDATE = "ICE_CANDIDATE",
  ANSWER = "ANSWER",
  OFFER = "OFFER"
}

export const SocketContext = createContext<{ socket: Socket }>({
  socket: null as unknown as Socket,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const [socket, setSocket] = useState<Socket>(null as unknown as Socket);

  useEffect(() => {
    const pathname = window.location.pathname;
    const ENDPOINT = (import.meta.env.VITE_SERVER_URL || "http://localhost:4000") + stripTrailingSlash(pathname);
    setSocket(io(ENDPOINT));
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
