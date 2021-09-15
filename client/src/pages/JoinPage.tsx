import React, { useState, useEffect, useContext } from "react";
import { SocketContext, DeviceContext } from "../contexts";
import { DeviceSelector } from "../components/DeviceSelector";
import { AudioVisualizer } from "../classes/AudioVisualizer";
import PropTypes from "prop-types";

const JoinPage = ({
  setName,
  setJoined,
}: {
  setName: (string) => void;
  setJoined: (string) => void;
}): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const { stream, setStream } = useContext(DeviceContext);

  const [gain, setGain] = useState(0);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);

  const onJoinClicked = () => {
    if (socket) {
      setJoined(true);
      visualizer.stop();
    }
  };

  const onClearClicked = () => {
    if (socket) {
      socket.emit("CLEAR_USERS");
    }
  };

  const onSelect = (_stream) => {
    setStream(_stream);
  };

  useEffect(() => {
    setVisualizer(new AudioVisualizer(onAudioActivity));
  }, []);

  useEffect(() => {
    if (visualizer) {
      visualizer.setStream(stream);
    }
  }, [stream]);

  const onAudioActivity = (_gain: number) => {
    setGain(_gain);
  };

  return (
    <>
      <div>
        <label>
          <div>Name:</div>
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
        <div>Select audio device:</div>
        <DeviceSelector onSelect={onSelect} />

        <div
          style={{
            width: gain.toString() + "px",
            height: "10px",
            background: "black",
          }}
        ></div>
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
