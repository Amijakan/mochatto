import React, { useContext } from "react";
import { SocketContext } from "./SocketIOContext";

const JoinPage = ({ name, setName, setJoined }) => {
  const { socket } = useContext(SocketContext);
  const onJoin = () => {
    if (socket) {
      // notify server on join
      socket.emit("NEW_USER", name);
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
        <button onClick={() => onJoin()}>Join</button>
      </div>
    </>
  );
};

export default JoinPage;
