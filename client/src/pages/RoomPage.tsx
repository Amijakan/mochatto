import React, { useState, useRef, useEffect, useContext } from "react";
import { SocketContext, DeviceContext, UserInfoContext } from "../contexts";
import { useHistory } from "react-router-dom";
import { DeviceSelector } from "../components/DeviceSelector";
import { Div, Notification, Icon, Text } from "atomize";
import AvatarCanvas from "../components/AvatarCanvas";
import { Network } from "../classes/Network";
import { UserInfo, defaultUserInfo } from "../contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "../classes/AudioVisualizer";
import { RoomTemplate } from "../templates";
import { Button } from "../components/atomize_wrapper";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from "@material-ui/icons/StopScreenShare";
import ScreenShareWindow from "../components/ScreenShareWindow";

import PropTypes from "prop-types";

const notificationColors = {
  join: { color: "success", icon: "Success" },
  leave: { color: "danger", icon: "Info" },
};

let globalUserInfos = {};

function RoomPage({ name }: { name: string }): JSX.Element {
  const [announcement, setAnnouncement] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTheme, setNotificationTheme] = useState("join");
  const { socket } = useContext(SocketContext);
  const { stream, setStream } = useContext(DeviceContext);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);
  const visualizerRef = useRef(visualizer);
  const [selfUserInfo, setSelfUserInfo] = useState<UserInfo>({ ...defaultUserInfo, name });
  const selfUserInfoRef = useRef(selfUserInfo);
  const { userInfos, addUserInfo, removeUserInfo } = useContext(UserInfoContext);
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState(new MediaStream());
  const screenShareStreamRef = useRef(screenShareStream);
  const networkRef = useRef(null as unknown as Network);

  // when new input is selected update all tracks and send a new offer out
  const onSelect = (_stream) => {
    setStream(_stream);
  };

  const updateSelfUserInfo = (info) => {
    selfUserInfoRef.current = info;
    setSelfUserInfo(info);
  };

  const updateVisualizer = (_visualizer) => {
    visualizerRef.current = _visualizer;
    setVisualizer(_visualizer);
  };

  const updateScreenShareStream = (_screenShareStream) => {
    screenShareStreamRef.current = _screenShareStream;
    setScreenShareStream(_screenShareStream);
  };

  const updateNetwork = (_network) => {
    networkRef.current = _network;
  };

  const toggleMute = () => {
    updateSelfUserInfo({ ...selfUserInfoRef.current, mute: !selfUserInfoRef.current.mute });
  };

  const toggleActive = () => {
    updateSelfUserInfo({
      ...selfUserInfoRef.current,
      active: !selfUserInfoRef.current.active,
      mute: selfUserInfoRef.current.active,
    });
  };

  const toggleScreenShare = () => {
    // If currently screen sharing, end the stream.
    if (selfUserInfoRef.current.isScreenSharing) {
      endScreenSharing();
    }
    updateSelfUserInfo({
      ...selfUserInfoRef.current,
      isScreenSharing: !selfUserInfoRef.current.isScreenSharing,
    });
  };

  // announce and set a new user on join
  const onJoin = (name) => {
    setAnnouncement(name + " has joined the room!");
    setNotificationTheme("join");
    setShowNotification(true);
  };

  // When a user leaves.
  const onLeave = (id: string) => {
    // Find the peer processor within the network and close the streams.
    networkRef.current.findPeerProcessorById(id).close();
    // Remove user from network.
    networkRef.current.removeFromNetwork(id);
    // Remove the avatar.
    removeUserInfo(id);
    // Set announcement.
    setAnnouncement(globalUserInfos[id].name + " has left.");
    setNotificationTheme("leave");
    setShowNotification(true);
  };

  const onAudioActivity = (gain: number) => {
    const newMultiplier = gainToMultiplier(gain);
    updateSelfUserInfo({ ...selfUserInfoRef.current, multiplier: newMultiplier });
  };

  const onStartScreenSharing = (_stream: MediaStream) => {
    const selfVideoPlayer = document.querySelector("video") || new HTMLVideoElement();
    selfVideoPlayer.srcObject = _stream;
    updateScreenShareStream(_stream);
    updateSelfUserInfo({ ...selfUserInfoRef.current, isScreenSharing: true });
    networkRef.current.updateAllTracks(_stream.getVideoTracks()[0]);
  };

  const onEndScreenSharing = () => {
    endScreenSharing();
    updateSelfUserInfo({ ...selfUserInfoRef.current, isScreenSharing: false });
  };

  const onFailedScreenSharing = (e) => {
    updateSelfUserInfo({ ...selfUserInfoRef.current, isScreenSharing: false });
  };

  const endScreenSharing = () => {
    screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
  };

  // open all listeners on render
  useEffect(() => {
    updateNetwork(new Network(socket, name, addUserInfo, selfUserInfoRef.current, stream));

    socket.on("JOIN", ({ name }) => {
      onJoin(name);
    });

    socket.on("LEAVE", ({ id }) => {
      onLeave(id);
    });

    socket.on("DISCONNECT", ({ id }) => {
      if (globalUserInfos[id]) {
        onLeave(id);
      }
    });

    updateVisualizer(new AudioVisualizer(onAudioActivity));

    window.onbeforeunload = () => {
      socket.emit("LEAVE");
      networkRef.current.close();
      stream.getTracks().forEach((track) => track.stop());
    };
    const onKey = (e) => {
      switch (e.key) {
        case "m":
          toggleMute();
          break;
        case ",":
          setShowModal(true);
          break;
        case "Escape":
          setShowModal(false);
          break;
        case "L":
          history.go(0);
          break;
        case "s":
          toggleActive();
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    globalUserInfos = userInfos;
  }, [userInfos]);

  useEffect(() => {
    if (stream) {
      if (networkRef.current) {
        networkRef.current.updateAllTracks(stream.getAudioTracks()[0]);
      }
      if (visualizerRef.current) {
        visualizerRef.current.setStream(stream);
      }
    }
  }, [stream]);

  // update remote position when avatar is dragged
  useEffect(() => {
    if (stream.getAudioTracks().length) {
      stream.getAudioTracks()[0].enabled = !selfUserInfoRef.current.mute;
    }
    if (networkRef.current) {
      networkRef.current.updateInfo(selfUserInfoRef.current);
    }
  }, [selfUserInfoRef.current]);

  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.toggleDeaf(!selfUserInfoRef.current.active);
    }
  }, [selfUserInfoRef.current.active]);

  const buttonStyle = {
    m: "0.3rem",
    bg: "none",
    h: "2.5rem",
    w: "2.5rem",
    hoverBg: "#ffffff29",
    rounded: "circle",
  };

  return (
    <RoomTemplate
      showModal={showModal}
      setShowModal={setShowModal}
      sideDrawerComponent={
        <Div>
          <Text>Choose your audio input source.</Text>
          <DeviceSelector onSelect={onSelect} />
        </Div>
      }
    >
      <>
        <Notification
          isOpen={showNotification}
          bg={`${notificationColors[notificationTheme].color}100`}
          textColor={`${notificationColors[notificationTheme].color}800`}
          onClose={() => setShowNotification(false)}
          prefix={
            <Icon
              name={notificationColors[notificationTheme].icon}
              color={`${notificationColors[notificationTheme].color}800`}
              size="18px"
              m={{ r: "0.5rem" }}
            />
          }
        >
          {announcement}
        </Notification>
        <AvatarCanvas
          selfUserInfo={selfUserInfoRef.current}
          setSelfUserInfo={updateSelfUserInfo}
          userInfos={Object.values(userInfos)}
        />
        <video style={{ width: "20%" }} autoPlay />
        {selfUserInfoRef.current.isScreenSharing ? (
          <ScreenShareWindow
            onStart={(_stream) => onStartScreenSharing(_stream)}
            onEnd={() => onEndScreenSharing()}
            onFailed={(e) => onFailedScreenSharing(e)}
          />
        ) : (
          <></>
        )}
        <Div d="flex" h="100%" flexDir="column">
          <Div d="flex" justify="center" m={{ t: "auto" }}>
            <Div d="inline-block">
              <Div rounded="circle" bg="#000000ba" d="flex" p={{ x: "1rem", y: "0.3rem" }}>
                <Button title="Settings (,)" {...buttonStyle} onClick={() => setShowModal(true)}>
                  <Icon name="SettingsSolid" color="white" size="24px" />
                </Button>
                <Button
                  title="Status (s)"
                  {...buttonStyle}
                  textColor={selfUserInfoRef.current.active ? "success700" : "danger700"}
                  onClick={() => toggleActive()}
                >
                  {selfUserInfoRef.current.active ? (
                    <Icon name="Status" color="success700" size="22px" />
                  ) : (
                    <Icon name="RemoveSolid" color="danger700" size="26px" />
                  )}
                </Button>
                <Button title="Toggle mute (m)" {...buttonStyle} onClick={() => toggleMute()}>
                  {selfUserInfoRef.current.mute ? <MicOffIcon /> : <MicIcon />}
                </Button>
                <Button title="Screen sharing" {...buttonStyle} onClick={() => toggleScreenShare()}>
                  {selfUserInfoRef.current.isScreenSharing ? (
                    <>
                      <StopScreenShareIcon />
                    </>
                  ) : (
                    <ScreenShareIcon />
                  )}
                </Button>
                <Button
                  title="Leave room (L)"
                  {...buttonStyle}
                  w="4rem"
                  onClick={() => history.go(0)}
                  textColor="red"
                >
                  Leave
                </Button>
              </Div>
            </Div>
          </Div>
        </Div>
      </>
    </RoomTemplate>
  );
}

RoomPage.propTypes = {
  name: PropTypes.string,
};

export default RoomPage;
