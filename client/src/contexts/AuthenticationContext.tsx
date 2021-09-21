import React, { useContext, createContext, useEffect, useState } from "react";
import { SocketContext } from "../contexts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthenticationContext = createContext<any>({});

export const AuthenticationProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const [roomExists, setRoomExists] = useState(false);
  const [roomId, setRoomId] = useState("");

  const [hash, setHash] = useState("");

  useEffect(() => {
    if (socket) {
      socket.on("NUM_USERS", (usersNum) => {
        if (usersNum === 0 || usersNum === null) {
          setRoomExists(false);
        } else {
          setRoomExists(true);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit("NUM_USERS", "/" + roomId);
    }
  }, [roomId]);

  return (
    <AuthenticationContext.Provider value={{ hash, setHash, roomExists, setRoomExists, roomId, setRoomId }}>
      {children}
    </AuthenticationContext.Provider>
  );
};
