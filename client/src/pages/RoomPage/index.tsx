import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Div, Notification, Icon, Text } from "atomize";
import _ from "lodash";
import { SocketContext, DeviceContext, UserInfoContext } from "@/contexts";
import { SIOChannel } from "@/contexts/SocketIOContext";
import { UserInfo, defaultUserInfo } from "@/contexts/UserInfoContext";
import { AvatarCanvas, ButtonsBar, DeviceSelector } from "@/components";
import { Network } from "@/classes/Network";
import { AudioVisualizer, gainToMultiplier } from "@/classes/AudioVisualizer";
import { RoomTemplate } from "@/templates";

import PropTypes from "prop-types";

const notificationColors = {
  join: { color: "success", icon: "Success" },
  leave: { color: "danger", icon: "Info" },
};


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
  const userInfosRef = useRef(userInfos)
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const networkRef = useRef(null as unknown as Network);

  // when new input is selected update all tracks and send a new offer out
  const onSelect = (_stream) => {
    setStream(_stream);
  };

  const updateSelfUserInfo = (info) => {
    const newInfo = { ...selfUserInfoRef.current, ...info };
    selfUserInfoRef.current = newInfo;
    setSelfUserInfo(newInfo);
    addUserInfo(socket.id)(newInfo);
  };

  const updateVisualizer = (_visualizer) => {
    visualizerRef.current = _visualizer;
    setVisualizer(_visualizer);
  };

  const updateNetwork = (_network) => {
    networkRef.current = _network;
  };

  const toggleMute = useCallback(() => {
    updateSelfUserInfo({ mute: !selfUserInfoRef.current.mute });
  }, [selfUserInfoRef.current.mute]);

  const handleLeaveClicked = useCallback(() => {
    history.go(0);
  }, []);

  const handleSettingClicked = useCallback(() => {
    setShowModal(true);
  }, []);

  const toggleActive = useCallback(() => {
    updateSelfUserInfo({
      active: !selfUserInfoRef.current.active,
      mute: selfUserInfoRef.current.active,
    });
  }, [selfUserInfoRef.current.active]);

  const toggleScreenShare = useCallback(() => {
    // If currently screen sharing, end the stream.
    if (selfUserInfoRef.current.isScreenSharing) {
      onEndScreenSharing();
    }
    updateSelfUserInfo({
      isScreenSharing: !selfUserInfoRef.current.isScreenSharing,
    });
  }, [selfUserInfoRef.current.isScreenSharing, stream]);

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
    setAnnouncement(userInfosRef.current[id].name + " has left.");
    setNotificationTheme("leave");
    setShowNotification(true);
  };

  const onAudioActivity = (gain: number) => {
    const newMultiplier = gainToMultiplier(gain);
    updateSelfUserInfo({ multiplier: selfUserInfoRef.current.mute ? 0 : newMultiplier });
  };

  const onStartScreenSharing = (_stream: MediaStream) => {
    const videoPlayer = document.createElement("video");
    const screenShareTrack = _.last(_stream.getVideoTracks());
    const mixedStream = stream.clone();

    // Set video player configurations and append to self avatar
    videoPlayer.srcObject = _stream;
    videoPlayer.autoplay = true;
    videoPlayer.muted = true;
    document.getElementById("avatar-video-" + socket.id)?.appendChild(videoPlayer);

    if (!selfUserInfoRef.current.isScreenSharing) {
      toggleScreenShare();
    }
    mixedStream.addTrack(screenShareTrack);
    setStream(mixedStream); // Seems reduntant but necessary to run the hook.
  };

  const onEndScreenSharing = () => {
    stream.getVideoTracks().forEach((track: MediaStreamTrack) => track.stop());
    document.getElementById("avatar-video-" + socket.id)?.firstChild?.remove();
  };

  const onFailedScreenSharing = (e) => {
    if (selfUserInfoRef.current.isScreenSharing) {
      toggleScreenShare();
    }
  };

  // open all listeners on render
  useEffect(() => {
    updateNetwork(new Network(socket, name, addUserInfo, selfUserInfoRef.current, stream));

    socket.on(SIOChannel.JOIN, ({ name }) => {
      onJoin(name);
    });

    socket.on(SIOChannel.LEAVE, ({ id }) => {
      onLeave(id);
    });

    socket.on(SIOChannel.DISCONNECT, ({ id }) => {
      if (userInfosRef.current[id]) {
        onLeave(id);
      }
    });

    updateVisualizer(new AudioVisualizer(onAudioActivity));

    window.onbeforeunload = () => {
      socket.emit(SIOChannel.LEAVE);
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
    if (stream) {
      if (networkRef.current) {
        networkRef.current.updateAllTracks(stream.getAudioTracks()[0]);
      }
      if (visualizerRef.current) {
        visualizerRef.current.setStream(stream);
      }
    }
  }, [stream]);

  useEffect(() => {
    updateSelfUserInfo({ id: socket.id });
  }, [socket]);

  useEffect(() => {
    networkRef.current?.replaceStream(stream);
    networkRef.current?.updateAllTracks(stream && stream.getAudioTracks()[0]);
    networkRef.current?.updateAllTracks(stream && _.last(stream.getVideoTracks()));
    visualizerRef.current?.setStream(stream);
  }, [stream]);

  // Update remote user info  when self info has been changed.
  useEffect(() => {
    if (stream.getAudioTracks().length) {
      stream
        .getAudioTracks()
        .forEach((audio: MediaStreamTrack) => (audio.enabled = !selfUserInfoRef.current.mute));
    }
    networkRef.current?.updateInfo(selfUserInfoRef.current);
  }, [selfUserInfoRef.current, stream]);

  useEffect(() => {
    networkRef.current?.setDeaf(!selfUserInfoRef.current.active);
  }, [selfUserInfoRef.current.active]);

  useEffect(() => {
    userInfosRef.current = userInfos;
  }, [userInfos]);
  const handleClickScreenSharing = useCallback(() => {
    if (!selfUserInfoRef.current.isScreenSharing) {
      navigator.mediaDevices
        .getDisplayMedia()
        .then((stream) => {
          onStartScreenSharing(stream);
          // Listener for toggling screen share info when the "Stop sharing" browser overlap button is pressed.
          stream.getVideoTracks()[stream.getVideoTracks().length - 1].onended = () => {
            toggleScreenShare();
          };
        })
        .catch((e) => {
          onFailedScreenSharing(e);
        });
    } else {
      toggleScreenShare();
    }
  }, [selfUserInfoRef.current.isScreenSharing, stream]);

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
          updateSelfUserInfo={updateSelfUserInfo}
          userInfos={Object.values(userInfos)}
        />
        <ButtonsBar
          onSettingsClicked={handleSettingClicked}
          onStatusClicked={toggleActive}
          onMuteClicked={toggleMute}
          onScreenShareClicked={handleClickScreenSharing}
          onLeaveClicked={handleLeaveClicked}
          userInfoRef={selfUserInfoRef}
        />
      </>
    </RoomTemplate>
  );
}

RoomPage.propTypes = {
  name: PropTypes.string,
};

export default RoomPage;
