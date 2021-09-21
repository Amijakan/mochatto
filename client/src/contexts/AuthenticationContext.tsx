import React, { useContext, createContext, useEffect, useState, useCallback } from "react";
import { SocketContext } from "../contexts";
import { createHash } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthenticationContext = createContext<any>({});

export const AuthenticationProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const [roomExists, setRoomExists] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [authenticated, setAuthenticated] = useState("");

  const checkPass = (pass) => {
    const hash = createHash("sha256").update(pass).digest("hex");
    if (socket) {
      console.log(hash);
      socket.emit("AUTHENTICATE", JSON.stringify({ hash, id: socket.id }));
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("AUTHENTICATE_RESPONSE", (auth) => {
        console.log(auth);
        setAuthenticated(auth);
      });
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
    <AuthenticationContext.Provider
      value={{
        roomExists,
        setRoomExists,
        roomId,
        setRoomId,
        checkPass,
        authenticated,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
