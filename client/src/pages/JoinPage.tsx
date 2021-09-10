import React, { useContext } from "react";
import { SocketContext } from "../contexts/SocketIOContext";
import PropTypes from "prop-types";

const JoinPage = ({
  setName,
  setJoined,
}: {
  setName: (string) => void;
  setJoined: (string) => void;
}): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const onJoinClicked = () => {
    if (socket) {
      setJoined(true);
    }
  };

  const onClearClicked = () => {
    if (socket) {
      socket.emit("CLEAR_USERS");
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
        <button onClick={() => onJoinClicked()}>Join</button>
      </div>
      <div>
        <button onClick={() => onClearClicked()}>Clear</button>
      </div>
    </>
  );
};

JoinPage.propTypes = {
  name: PropTypes.string,
  setName: PropTypes.func,
  setJoined: PropTypes.func,
};

export default JoinPage;
