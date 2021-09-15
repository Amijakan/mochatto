import React, { useState, useEffect, useContext } from "react";
import { SocketContext, DeviceContext } from "../contexts";
import { DeviceSelector } from "../components/DeviceSelector";
import { AudioVisualizer } from "../classes/AudioVisualizer";
import PropTypes from "prop-types";
import { Input } from "atomize";
import { Div, Button } from "atomize";
import { colors } from "../constants/colors";
import BaseTemplate from "../templates/BaseTemplate";

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
    <BaseTemplate>
      <Div d="flex" justify="center">
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
          <Div d="flex" justify="space-around">
            <Button
              h="3rem"
              p={{ x: "1.25rem" }}
              m={{ r: "0.5rem" }}
              textSize="body"
              onClick={() => onJoinClicked()}
              bg={colors.fg}
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
      </Div>
    </BaseTemplate>
  );
};

JoinPage.propTypes = {
  name: PropTypes.string,
  setName: PropTypes.func,
  setJoined: PropTypes.func,
};

export default JoinPage;
