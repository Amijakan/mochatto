import React, { useState, useEffect, useContext } from "react";
import { SocketContext } from "../contexts/SocketIOContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { DeviceSelector } from "../DeviceSelector";
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
  const [drawInterval, setDrawInterval] = useState(0);
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

  const onSelect = (_stream) => {
    console.debug(_stream);
    setStream(_stream);
  };

  useEffect(() => {
    if (stream) {
      if (stream.active) {
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 1024;

        // chain mic -> analyser -> processor -> context
        source.connect(analyser); // feed mic audio into analyser

        if (drawInterval) {
          window.clearInterval(drawInterval);
          setGain(0);
        }
        const draw = () => {
          const array = new Uint8Array(analyser.fftSize);
          analyser.getByteFrequencyData(array);

          let sum = 0;
          array.forEach((e, i) => {
            sum += e * 4;
          });
          const average = sum / array.length;
          if (average != 0) {
            setGain(average);
          }
        };
        setDrawInterval(window.setInterval(draw, 50));
      }
    }
  }, [stream]);

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
