import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { SocketContext, DeviceContext } from "@/contexts";
import { SIOChannel } from "@/contexts/SocketIOContext";
import { DeviceSelector } from "@/components";
import { AudioVisualizer, gainToMultiplier } from "@/classes/AudioVisualizer";
import PropTypes from "prop-types";
import { Div, Notification, Icon } from "atomize";
import { Button, Card, Text, Input, Label } from "@/components/atomize_wrapper";
import { BaseTemplate } from "@/templates";
import cx from "classnames";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
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
  const [notificationText, setNotificationText] = useState("");

  // The password text.
  const [password, setPassword] = useState("");
  // A boolean to decide whether to disable the password input or not.
  const [requirePassword, setRequirePassword] = useState(false);
  // A boolean to decide whether to show the password input or not.
  const [showPassword, setShowPassword] = useState(false);
  // A boolean to decide whether to show the password choice button or not.
  const [showPasswordChoice, setShowPasswordChoice] = useState(false);
  // Has all asynchronous data finished loading?
  const [finishedLoading, setFinishedLoading] = useState(false);

  const history = useHistory();

  const [gain, setGain] = useState(0);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);

  // Authentication codes to be returned back by the server.
  // Needs to be in sync with the backend enum.
  enum AuthenticationEnum {
    Success = 200,
    Unauthorized = 401,
  }

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const onJoinClicked = () => {
    if (!socket) {
      setNotificationText("Socket is not ready. Please try again.");
      setShowNotification(true);
      return;
    }

    if (!finishedLoading) {
      setNotificationText("Failed to connect with server.");
      setShowNotification(true);
      return;
    }

    // The hash to send to server for authentication.
    // Needs to be in agreement with the backend when providing an empty password.
    const hash = sha256(room_id + password);

    hash.then((hash) => {
      socket.emit(SIOChannel.AUTHENTICATE, hash);
    });

    // Handle the authentication result.
    socket.on(SIOChannel.AUTHENTICATE, (result) => {
      if (result == AuthenticationEnum.Success) {
        if (name != "") {
          setJoined(true);
        } else {
          setNotificationText("Please choose a username.");
          setShowNotification(true);
        }
      } else {
        setNotificationText("Incorrect password.");
        setShowNotification(true);
      }
    });
  };

  const onSelect = (_stream) => {
    setStream(_stream);
  };

  useEffect(() => {
    setVisualizer(new AudioVisualizer(onAudioActivity));
  }, []);

  useEffect(() => {
    if (socket) {
      // Retrieve information about the room existing and whether it requires a password or not.
      socket.emit(SIOChannel.ROOM_INFO);
      socket.on(SIOChannel.ROOM_INFO, (info) => {
        const { numUsers, hasPass } = info;
        const roomExists = !!numUsers;
        if (!roomExists) {
          setShowPassword(true);
          setShowPasswordChoice(true);
        } else if (hasPass) {
          setShowPassword(true);
          setRequirePassword(true);
        }
        setFinishedLoading(true);
      });

      socket.on(SIOChannel.CONNECT_ERROR, (err) => {
        setNotificationText("Failed to establish connection. Retrying...");
        setShowNotification(true);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (visualizer) {
      visualizer.setStream(stream);
    }
  }, [stream]);

  const onAudioActivity = (_gain: number) => {
    setGain(_gain);
  };

  const togglePasswordRequirement = () => {
    setRequirePassword(!requirePassword);
    setPassword("");
  };

  function Visualizer() {
    return (
      <div
        className="visualizer"
        style={{
          width: (gainToMultiplier(gain) * 100).toString() + "%",
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
                {notificationText}
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
              {finishedLoading && (
                <Div className="password-wrapper">
                  {showPasswordChoice && (
                    <Button
                      className={cx("password-toggle", { "locked-style": requirePassword })}
                      onClick={() => togglePasswordRequirement()}
                    >
                      {requirePassword ? <LockIcon /> : <LockOpenIcon />}
                    </Button>
                  )}
                  {showPassword && (
                    <Input
                      className={cx("password-input", {
                        disabled: !requirePassword,
                      })}
                      placeholder="Password"
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                    />
                  )}
                </Div>
              )}
            </Div>
            <Div m={{ t: "20px" }}>
              <Div>Select audio device:</Div>
              <DeviceSelector onSelect={onSelect} />
            </Div>
            {Visualizer()}
            <Div d="flex" justify="space-around" w="100%" m={{ t: "20px" }}>
              <Button w="45%" onClick={() => onJoinClicked()}>
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
