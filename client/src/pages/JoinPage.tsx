import React, { useState, useEffect, useContext } from "react";
import { SocketContext, DeviceContext } from "../contexts";
import { DeviceSelector } from "../components/DeviceSelector";
import PropTypes from "prop-types";
import { Input } from "atomize";
import { Div, Button } from "atomize";

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
          array.forEach((e) => {
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
      <Div w="50%" p={{ x: "1.25rem", y: "1.25rem" }}>
        <Div>
          <Input
            placeholder="Name"
            type="text"
            name="name"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Div>
        <Div>
          <Div>Select audio device:</Div>
          <DeviceSelector onSelect={onSelect} />
          <Div
            style={{
              width: gain.toString() + "px",
              height: "10px",
              background: "black",
            }}
          ></Div>
        </Div>
        <Div d="flex">
          <Button
            h="3rem"
            p={{ x: "1.25rem" }}
            m={{ r: "0.5rem" }}
            textSize="body"
            onClick={() => onJoinClicked()}
          >
            Join
          </Button>
          <Button
            h="3rem"
            p={{ x: "1.25rem" }}
            m={{ r: "0.5rem" }}
            textSize="body"
            onClick={() => onClearClicked()}
          >
            Clear
          </Button>
        </Div>
      </Div>
    </>
  );
};

JoinPage.propTypes = {
  name: PropTypes.string,
  setName: PropTypes.func,
  setJoined: PropTypes.func,
};

export default JoinPage;
