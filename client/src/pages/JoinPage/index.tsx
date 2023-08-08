import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import { SocketContext, UserStreamContext } from "@/contexts";
import { SIOChannel } from "@/shared/socketIO";
import { DeviceSelector, Button } from "@/components";
import { AudioVisualizer, gainToMultiplier } from "@/classes/AudioVisualizer";
import PropTypes from "prop-types";
import { Div, Notification, Icon } from "atomize";
import { Card, Text, Input, Label } from "@/components/atomize_wrapper";
import { BaseTemplate } from "@/templates";
import cx from "classnames";
import { Lock as LockIcon, LockOpen as LockOpenIcon, VisibilityOff as VisibilityOffIcon, Visibility as VisibilityIcon } from "@material-ui/icons";

import { AuthenticationEnum } from '@/shared/authentication'

import "./style.scss";

interface NotificationState {
  text: string;
  isOpen: boolean;
}

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
  const { userStreams, updateUserStream } = useContext(UserStreamContext);
  const { room_id } = useParams<{ room_id: string }>();
  const [notificationState, setNotificationState] = useState({
    text: "",
    isOpen: false,
  } as NotificationState);

  const [password, setPassword] = useState("");
  const [isPasswordRequired, setPasswordRequired] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPasswordChoice, setShowPasswordChoice] = useState(false);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [isPasswordTextVisible, setPasswordTextVisibility] = useState(false);

  const history = useHistory();

  const [gain, setGain] = useState(0);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const selfStream = useMemo(() => userStreams[socket?.id], [socket, userStreams]);

  const onJoinClicked = () => {
    if (!socket) {
      setNotificationState({ text: "Socket is not ready. Please try again.", isOpen: true });
      return;
    }

    if (!finishedLoading) {
      setNotificationState({ text: "Failed to connect with server.", isOpen: true });
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
          setNotificationState({ text: "Please choose a username.", isOpen: true });
        }
      } else {
        setNotificationState({ text: "Incorrect password.", isOpen: true });
      }
    });
  };

  const onSelect = useCallback((_stream) => {
    updateUserStream(socket?.id)(_stream);
  }, [socket]);

  useEffect(() => {
    setVisualizer(new AudioVisualizer(onAudioActivity));
    const keyListener = (event) => {
      if (event.code === "Enter") {
        event.preventDefault();
        onJoinClicked();
      }
    };
    document.addEventListener("keydown", keyListener);

    return () => {
      document.removeEventListener("keydown", keyListener);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      // Retrieve information about the room existing and whether it requires a password or not.
      socket.emit(SIOChannel.ROOM_INFO);
      socket.on(SIOChannel.ROOM_INFO, (info) => {
        const { numUsers, hasPass } = info;
        const roomExists = !!numUsers;
        if (!roomExists) {
          setShowPasswordInput(true);
          setShowPasswordChoice(true);
        } else if (hasPass) {
          setShowPasswordInput(true);
          setPasswordRequired(true);
        }
        setFinishedLoading(true);
      });

      socket.on(SIOChannel.CONNECT_ERROR, (err) => {
        setNotificationState({ text: "Failed to establish connection. Retrying...", isOpen: true });
      });
    }
  }, [socket]);

  useEffect(() => {
    if (visualizer) {
      visualizer.setStream(selfStream);
    }
  }, [selfStream]);

  const onAudioActivity = (_gain: number) => {
    setGain(_gain);
  };

  const togglePasswordRequirement = () => {
    setPasswordRequired(!isPasswordRequired);
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
      <div className="join-page">
        <div className="action-card">
          <div className="card-inner-wrapper">
            <Text textSize="20px" m={{ b: "20px" }}>
              Room ID: <b>{room_id}</b>
            </Text>
            <Div>
              <Notification
                isOpen={notificationState.isOpen}
                bg={"danger700"}
                onClose={() => setNotificationState({ ...notificationState, isOpen: false })}
                prefix={<Icon name="CloseSolid" color="white" size="18px" m={{ r: "0.5rem" }} />}
              >
                {notificationState.text}
              </Notification>
              <Input
                placeholder="Name"
                type="text"
                name="name"
                onBlur={(e) => {
                  setName(e.target.value);
                }}
              />
              {finishedLoading && (
                <Div className="password-wrapper">
                  {showPasswordChoice && (
                    <Button
                      className={cx("password-toggle", { "locked-style": isPasswordRequired })}
                      onClick={() => togglePasswordRequirement()}
                    >
                      {isPasswordRequired ? <LockIcon /> : <LockOpenIcon />}
                    </Button>
                  )}
                  {showPasswordInput && (
                    <>
                      <Input
                        className={cx("password-input", {
                          disabled: !isPasswordRequired,
                        })}
                        placeholder="Password"
                        type={isPasswordTextVisible ? "text" : "password"}
                        name="password"
                        onBlur={(e) => {
                          setPassword(e.target.value);
                        }}
                      />
                      {isPasswordRequired && (
                        <Button
                          className="password-visibility-button"
                          onClick={() => setPasswordTextVisibility(!isPasswordTextVisible)}
                        >
                          {isPasswordTextVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </Button>
                      )}
                    </>
                  )}
                </Div>
              )}
            </Div>
            <Div m={{ t: "20px" }}>
              <Div>Select audio device:</Div>
              <DeviceSelector onSelect={onSelect} />
            </Div>
            {Visualizer()}
            <div className="join-back-container">
              <Button onClick={() => onJoinClicked()} className="primary">
                Join
              </Button>
              <Button
                className="secondary"
                onClick={() => {
                  history.push("/");
                  history.go(0);
                }}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
};

JoinPage.propTypes = {
  name: PropTypes.string,
  setName: PropTypes.func,
  setJoined: PropTypes.func,
};

export default JoinPage;
