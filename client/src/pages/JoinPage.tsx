import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { SocketContext, DeviceContext, AuthenticationContext } from "../contexts";
import { DeviceSelector } from "../components/DeviceSelector";
import { AudioVisualizer } from "../classes/AudioVisualizer";
import PropTypes from "prop-types";
import { Input } from "../components/atomize_wrapper";
import { Div, Icon } from "atomize";
import { Button, Card, Text } from "../components/atomize_wrapper";
import { BaseTemplate } from "../templates";
import { colors } from "../constants/colors";

const JoinPage = ({
  setName,
  setJoined,
}: {
  setName: (string) => void;
  setJoined: (string) => void;
}): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const { checkPass, authenticated } = useContext(AuthenticationContext);
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { stream, setStream } = useContext(DeviceContext);
  const { room_id } = useParams<{ room_id: string }>();
  const history = useHistory();

  const [gain, setGain] = useState(0);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);

  const onJoinClicked = () => {
    checkPass(pass);
    visualizer.stop();
  };

  const onSelect = (_stream) => {
    setStream(_stream);
  };

  useEffect(() => {
    setVisualizer(new AudioVisualizer(onAudioActivity));
  }, []);

  useEffect(() => {
    setJoined(authenticated);
  }, [authenticated]);

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
      <Div d="flex" justify="space-around" p={{ t: "100px" }}>
        <Card m={{ l: "10%", r: "10%" }}>
          <Div w="80%" p={{ x: "1.25rem", y: "1.25rem" }}>
            <Text textSize="20px" m={{ b: "20px" }}>
              Room ID: <b>{room_id}</b>
            </Text>
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
            <Div m={{ t: "20px" }}>
              <Div>Select audio device:</Div>
              <DeviceSelector onSelect={onSelect} />
              <Div
                style={{
                  width: gain.toString() + "px",
                  height: "10px",
                  background: colors.bg,
                }}
              ></Div>
            </Div>
            <Div>
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                suffix={
                  <Button
                    pos="absolute"
                    onClick={() => setShowPassword(!showPassword)}
                    bg="transparent"
                    w="3rem"
                    top="0"
                    right="0"
                    rounded={{ r: "md" }}
                  >
                    <Icon
                      name={showPassword ? "EyeSolid" : "Eye"}
                      color={showPassword ? "danger800" : "success800"}
                      size="16px"
                    />
                  </Button>
                }
                onChange={(e) => {
                  setPass(e.target.value);
                }}
              />
            </Div>
            <Div d="flex" justify="space-around" w="100%" m={{ t: "20px" }}>
              <Button w="45%" onClick={() => onJoinClicked()}>
                Join
              </Button>
              <Button w="45%" onClick={() => history.push("/")} bg="gray">
                Back
              </Button>
            </Div>
          </Div>
        </Card>
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
