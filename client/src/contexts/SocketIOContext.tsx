import React, { createContext, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import PropTypes from "prop-types";

const getRoomName = (nsp: string) => {
  // Replace split with path.basename if possible.
  return encodeURIComponent(nsp.split("/")[1]);
};

export enum SIOChannel {
  AUTHENTICATE = "AUTHENTICATE",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  DISCONNECT = "DISCONNECT",
  SDP_RECEIVED = "SDP_RECEIVED",
  ICE_CANDIDATE = "ICE_CANDIDATE",
  ANSWER = "ANSWER",
  OFFER = "OFFER",
}

export const SocketContext = createContext<{ socket: Socket }>({
  socket: null as unknown as Socket,
});

export const SocketProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [socket, setSocket] = useState<Socket>(null as unknown as Socket);

  useEffect(() => {
    const pathname = window.location.pathname;

    const baseURL: string =
      (import.meta.env.VITE_SERVER_URL as unknown as string) || "http://localhost:4000";
    const ENDPOINT = baseURL + "/" + getRoomName(pathname);
    setSocket(io(ENDPOINT));
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
