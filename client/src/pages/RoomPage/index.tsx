import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Div, Notification, Icon, Text } from "atomize";
import {
  AvatarCanvas,
  ButtonsBar,
  DeviceSelector,
  Sidebar,
  AutoSleepToggle,
  Divider,
} from "@/components";
import _ from "lodash";
import cx from "classnames";
import { isMobile } from "@/utils";
import { SocketContext, DeviceContext, UserInfoContext } from "@/contexts";
import { SIOChannel } from "@/shared/socketIO";
import { UserInfo, defaultUserInfo } from "@/contexts/UserInfoContext";
import { Network } from "@/classes/Network";
import { AudioVisualizer, gainToMultiplier } from "@/classes/AudioVisualizer";
import { RoomTemplate } from "@/templates";
import "./style.scss";
import joinSoundSrc from "@/assets/sound/join.ogg";
import leaveSoundSrc from "@/assets/sound/leave.ogg";

import PropTypes from "prop-types";

const notificationColors = {
  join: { color: "success", icon: "Success" },
  leave: { color: "danger", icon: "Info" },
};

function RoomPage({ name }: { name: string }): JSX.Element {
  const [announcement, setAnnouncement] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTheme, setNotificationTheme] = useState("join");
  const [isAutoSleepDisabled, setAutoSleepDisabled] = useState(false);
  const { socket } = useContext(SocketContext);
  const { stream, setStream } = useContext(DeviceContext);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);
  const { userInfos, addUserInfo, removeUserInfo } = useContext(UserInfoContext);
  const userInfosRef = useRef(userInfos);
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const networkRef = useRef(null as unknown as Network);
  const [soundEffectPlayer, setSoundEffectPlayer] = useState<HTMLAudioElement | null>(null);

  const selfInfo = useMemo(() => {
    return userInfos[socket.id];
  }, [userInfos[socket.id]]);

  // when new input is selected update all tracks and send a new offer out
  const onSelect = (_stream) => {
    setStream(_stream);
  };

  const updateSelfUserInfo = useCallback((info: Partial<UserInfo>) => {
    let newInfo = { ...info };
    if (selfInfo) {
      newInfo = { ...selfInfo, ...info };
    }

    addUserInfo(socket.id)(newInfo);
  }, [selfInfo]);

  const updateNetwork = (_network) => {
    networkRef.current = _network;
  };

  const toggleMute = useCallback(() => {
    updateSelfUserInfo({ mute: !selfInfo.mute });
  }, [selfInfo]);

  const handleLeaveClicked = useCallback(() => {
    history.go(0);
  }, []);

  const handleSettingClicked = useCallback(() => {
    setShowModal(true);
  }, []);

  const toggleActive = useCallback(() => {
    updateSelfUserInfo({
      active: !selfInfo.active,
      mute: selfInfo.active,
    });
  }, [selfInfo]);

  const toggleScreenShare = useCallback(() => {
    // If currently screen sharing, end the stream.
    if (selfInfo.isScreenSharing) {
      onEndScreenSharing();
    }
    updateSelfUserInfo({
      isScreenSharing: !selfInfo.isScreenSharing,
    });
  }, [selfInfo, stream]);

  // announce and set a new user on join
  const onJoin = (name) => {
    setAnnouncement(name + " has joined the room!");
    setNotificationTheme("join");
    setShowNotification(true);
    setSoundEffectPlayer(new Audio(joinSoundSrc));
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
    setAnnouncement(userInfosRef.current.name + " has left.");
    setNotificationTheme("leave");
    setShowNotification(true);
    setSoundEffectPlayer(new Audio(leaveSoundSrc));
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

    if (!selfInfo.isScreenSharing) {
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
    if (selfInfo.isScreenSharing) {
      toggleScreenShare();
    }
  };

  // open all listeners on render
  useEffect(() => {
    updateSelfUserInfo({ name, id: socket.id });
    updateNetwork(new Network(socket, name, addUserInfo, selfInfo, stream));

    socket.on(SIOChannel.JOIN, ({ name }) => {
      onJoin(name);
    });

    socket.on(SIOChannel.LEAVE, ({ id }) => {
      onLeave(id);
    });

    socket.on(SIOChannel.DISCONNECT, ({ id }) => {
      if (userInfosRef.current) {
        onLeave(id);
      }
    });

    socket.on(SIOChannel.EDIT_USER_NAME, ({ id, name }) => {
      if (id === socket.id) {
        updateSelfUserInfo({ name });
      } else {
        const newInfo = { ...userInfosRef.current, name };
        userInfosRef.current = newInfo;
        addUserInfo(newInfo);
      }
    });

    setVisualizer(new AudioVisualizer(addUserInfo(socket.id)));

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
    if (soundEffectPlayer != null) {
      // If no other sound is playing.
      if (soundEffectPlayer.paused && !soundEffectPlayer.duration) {
        soundEffectPlayer.play();
      }
    }
  }, [soundEffectPlayer]);

  useEffect(() => {
    networkRef.current?.replaceStream(stream);
    networkRef.current?.updateAllTracks(stream && stream.getAudioTracks()[0]);
    networkRef.current?.updateAllTracks(stream && _.last(stream.getVideoTracks()));
    visualizer?.setStream(stream);
  }, [stream, visualizer]);

  // Update remote user info  when self info has been changed.
  useEffect(() => {
    if (!selfInfo) {
      return;
    }

    networkRef.current?.setDeaf(!selfInfo.active);

    if (stream.getAudioTracks().length) {
      stream
        .getAudioTracks()
        .forEach((audio: MediaStreamTrack) => (audio.enabled = !selfInfo.mute));
    }
    networkRef.current?.updateInfo(selfInfo);
  }, [selfInfo, stream, visualizer]);

  const handleClickScreenSharing = useCallback(() => {
    if (!selfInfo.isScreenSharing) {
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
  }, [selfInfo, stream]);

  return (
    <RoomTemplate
      showModal={showModal}
      setShowModal={setShowModal}
      sideDrawerComponent={
        <Div>
          <Text>Choose your audio input source.</Text>
          <DeviceSelector onSelect={onSelect} />
          <Divider className={cx("setting-divider", { hidden: !isMobile })} />
          <AutoSleepToggle
            isAutoSleepDisabled={isAutoSleepDisabled}
            setAutoSleepDisabled={setAutoSleepDisabled}
          />
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
          selfUserInfo={selfInfo}
          updateSelfUserInfo={updateSelfUserInfo}
          userInfos={Object.values(userInfos)}
          setSoundEffectPlayer={setSoundEffectPlayer}
        />
        <ButtonsBar
          onSettingsClicked={handleSettingClicked}
          onStatusClicked={toggleActive}
          onMuteClicked={toggleMute}
          onScreenShareClicked={handleClickScreenSharing}
          onLeaveClicked={handleLeaveClicked}
          userInfo={selfInfo}
        />
        <Sidebar />
      </>
    </RoomTemplate>
  );
}

RoomPage.propTypes = {
  name: PropTypes.string,
};

export default RoomPage;
