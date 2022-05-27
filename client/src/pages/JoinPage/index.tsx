import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { SocketContext, DeviceContext } from "@/contexts";
import { DeviceSelector } from "@/components";
import { AudioVisualizer } from "@/classes/AudioVisualizer";
import PropTypes from "prop-types";
import { Div, Notification, Icon } from "atomize";
import { Button, Card, Text, Input } from "@/components/atomize_wrapper";
import { BaseTemplate } from "@/templates";
import "./style.scss";

const JoinPage = ({
  name,
  setName,
  setJoined,
}: {
  name: string;
  setName: (string) => void;
  setJoined: (string) => void;
}): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const { stream, setStream } = useContext(DeviceContext);
  const { room_id } = useParams<{ room_id: string }>();
  const [showNotification, setShowNotification] = useState(false);
  const history = useHistory();

  const [gain, setGain] = useState(0);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);

  const onJoinClicked = () => {
    if (socket) {
      if (name != "") {
        setJoined(true);
        visualizer.stop();
      } else {
        setShowNotification(true);
      }
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

  function Visualizer() {
    return (
      <div
        className="visualizer"
        style={{
          width: gain.toString() + "px",
        }}
      />
    );
  }

  return (
    <BaseTemplate>
      <Div d="flex" justify="space-around" p={{ t: "100px" }}>
        <Card m={{ l: "10%", r: "10%" }}>
          <Div w="80%" p={{ x: "1.25rem", y: "1.25rem" }}>
            <Text textSize="20px" m={{ b: "20px" }}>
              Room ID: <b>{room_id}</b>
            </Text>
            <Div>
              <Notification
                isOpen={showNotification}
                bg={"danger700"}
                onClose={() => setShowNotification(false)}
                prefix={<Icon name="CloseSolid" color="white" size="18px" m={{ r: "0.5rem" }} />}
              >
                Please choose a username.
              </Notification>
              <Input
                placeholder="Name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Div>
            <Div m={{ t: "20px" }}>
              <Div>Select audio device:</Div>
              <DeviceSelector onSelect={onSelect} />
            </Div>
            {Visualizer()}
            <Div d="flex" justify="space-around" w="100%" m={{ t: "20px" }}>
              <Button
                w="45%"
                onClick={() => onJoinClicked()}
              >
                Join
              </Button>
              <Button
                w="45%"
                onClick={() => {
                  history.push("/");
                  history.go(0);
                }}
                bg="gray"
              >
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
