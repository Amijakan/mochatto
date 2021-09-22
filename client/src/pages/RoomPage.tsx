import React, { useState, useRef, useEffect, useContext } from "react";
import { SocketContext, DeviceContext, UserInfoContext } from "../contexts";
import { DeviceSelector } from "../components/DeviceSelector";
import { Div, Notification, Icon, Text } from "atomize";
import AvatarCanvas from "../components/AvatarCanvas";
import { Network } from "../classes/Network";
import { UserInfo, defaultUserInfo } from "../contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "../classes/AudioVisualizer";
import { RoomTemplate } from "../templates";

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

  const [network, setNetwork] = useState<Network>(null as unknown as Network);

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

  // announce and set a new user on join
  const onJoin = (name) => {
    setAnnouncement(name + " has joined the room!");
    setNotificationTheme("join");
    setShowNotification(true);
  };

  const onLeave = (id: string) => {
    setAnnouncement(globalUserInfos[id].name + " has left.");
    removeUserInfo(id);
    setNotificationTheme("leave");
    setShowNotification(true);
  };

  const onAudioActivity = (gain: number) => {
    const newMultiplier = gainToMultiplier(gain);
    updateSelfUserInfo({ ...selfUserInfoRef.current, multiplier: newMultiplier });
  };

  // open all listeners on render
  useEffect(() => {
    setNetwork(new Network(socket, name, addUserInfo, selfUserInfoRef.current, stream));

    socket.on("JOIN", ({ name }) => {
      onJoin(name);
    });

    socket.on("LEAVE", ({ id }) => {
      onLeave(id);
    });

    updateVisualizer(new AudioVisualizer(onAudioActivity));

    window.onbeforeunload = (event) => {
      console.log("unmount");
      socket.emit("LEAVE");
      network.close();
      stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    globalUserInfos = userInfos;
  }, [userInfos]);

  useEffect(() => {
    if (network) {
      network.updateAllTracks(stream.getAudioTracks()[0]);
    }
    if (visualizerRef.current) {
      visualizerRef.current.setStream(stream);
    }
  }, [stream]);

  // update remote position when avatar is dragged
  useEffect(() => {
    if (network) {
      network.updateInfo(selfUserInfoRef.current);
    }
  }, [selfUserInfoRef.current]);

  return (
    <RoomTemplate
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
        <Div w="50%" p={{ x: "1.25rem", y: "1.25rem" }}>
          <AvatarCanvas
            selfUserInfo={selfUserInfoRef.current}
            setSelfUserInfo={updateSelfUserInfo}
            userInfos={Object.values(userInfos)}
          />
        </Div>
      </>
    </RoomTemplate>
  );
}

RoomPage.propTypes = {
  name: PropTypes.string,
};

export default RoomPage;
