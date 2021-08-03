import React, { useState } from "react";
import { Link } from "react-router-dom";

function JoinPage(props) {
  const [name, setName] = useState("");

  const onJoin = () => {
    if (props.socket) {
      // notify server on join
      props.socket.emit("NEW_USER", name);
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
        <Link to="/RoomPage" onClick={onJoin}>
          Join
        </Link>
      </div>
    </>
  );
}

export default JoinPage;
