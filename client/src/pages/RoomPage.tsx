import React, { useState, useRef, useEffect, useContext } from "react";
import { SocketContext, DeviceContext, UserInfoContext } from "@/contexts";
import { useHistory } from "react-router-dom";
import { DeviceSelector } from "@/components/DeviceSelector";
import { Div, Notification, Icon, Text } from "atomize";
import ScreenShareWindow from "@/components/ScreenShareWindow";
import AvatarCanvas from "@/components/AvatarCanvas";
import { ButtonsBar } from "@/components/ButtonsBar";
import { Network } from "@/classes/Network";
import { UserInfo, defaultUserInfo } from "@/contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "@/classes/AudioVisualizer";
import { RoomTemplate } from "@/templates";

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
    const videoPlayer = document.createElement("video");
    const screenShareTrack = _stream.getVideoTracks()[0];
    const mixedStream = stream.clone();

    // Set video player configurations and append to self avatar
    videoPlayer.srcObject = _stream;
    videoPlayer.autoplay = true;
    document.getElementById("avatar-video-" + socket.id)?.appendChild(videoPlayer);

    updateSelfUserInfo({ ...selfUserInfoRef.current, isScreenSharing: true });
    mixedStream.addTrack(screenShareTrack);
    setStream(mixedStream); // Seems reduntant but necessary to run the hook.
  };

  const onEndScreenSharing = () => {
    document.getElementById("avatar-video-" + socket.id)?.firstChild?.remove();
    endScreenSharing();
    updateSelfUserInfo({ ...selfUserInfoRef.current, isScreenSharing: false });
  };

  const onFailedScreenSharing = (e) => {
    updateSelfUserInfo({ ...selfUserInfoRef.current, isScreenSharing: false });
  };

  const endScreenSharing = () => {
    stream.getTracks().forEach((track) => track.kind === "video" && track.stop());
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
    updateSelfUserInfo({ ...selfUserInfoRef.current, id: socket.id });
  }, [socket]);

  useEffect(() => {
    networkRef.current?.replaceStream(stream);
    networkRef.current?.updateAllTracks(stream && stream.getAudioTracks()[0]);
    networkRef.current?.updateAllTracks(stream && stream.getVideoTracks()[0]);
    visualizerRef.current?.setStream(stream);
  }, [stream]);

  // Update remote user info  when self info has been changed.
  useEffect(() => {
    if (stream && stream.getAudioTracks().length) {
      stream.getAudioTracks()[0].enabled = !selfUserInfoRef.current.mute;
    }
    networkRef.current?.updateInfo(selfUserInfoRef.current);
  }, [selfUserInfoRef.current]);

  useEffect(() => {
    networkRef.current?.toggleDeaf(!selfUserInfoRef.current.active);
  }, [selfUserInfoRef.current.active]);

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
        {selfUserInfoRef.current.isScreenSharing ? (
          <ScreenShareWindow
            onStart={(_stream) => onStartScreenSharing(_stream)}
            onEnd={() => onEndScreenSharing()}
            onFailed={(e) => onFailedScreenSharing(e)}
          />
        ) : (
          <></>
        )}
        <ButtonsBar
          onSettingsClicked={() => setShowModal(true)}
          onStatusClicked={() => toggleActive()}
          onMuteClicked={() => toggleMute()}
          onScreenShareClicked={() => toggleScreenShare()}
          onLeaveClicked={() => history.go(0)}
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
