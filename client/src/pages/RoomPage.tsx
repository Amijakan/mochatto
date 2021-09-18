import React, { useState, useRef, useEffect, useContext } from "react";
import { SocketContext, PositionsContext, DeviceContext, UserInfoContext } from "../contexts";
import { DeviceSelector } from "../components/DeviceSelector";
import { Div, Notification, Icon, Text } from "atomize";
import AvatarCanvas from "../components/AvatarCanvas";
import {
  pushToNetwork,
  removeFromNetwork,
  updateAllTracks,
  broadcastOffer,
  broadcastData,
} from "../classes/Network";
import {
  requestNetworkInfo,
  openJoinListener,
  openLeaveListener,
  openRequestUsersListener,
} from "./RoomPageHelper";
import { PeerProcessor } from "../classes/PeerProcessor";
import { UserInfo, defaultUserInfo } from "../contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "../classes/AudioVisualizer";
import { RoomTemplate } from "../templates";

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
  const { selfPosition, setSelfPosition, peerPositions, addAvatar, removeAvatar } =
    useContext(PositionsContext);
  const selfPositionRef = useRef(selfPosition);
  const [visualizer, setVisualizer] = useState(null as unknown as AudioVisualizer);
  const visualizerRef = useRef(visualizer);
  const [selfUserInfo, setSelfUserInfo] = useState<UserInfo>({ ...defaultUserInfo, name });
  const selfUserInfoRef = useRef(selfUserInfo);
  const { userInfos, addUserInfo, removeUserInfo } = useContext(UserInfoContext);

  // when new input is selected update all tracks and send a new offer out
  const onSelect = (_stream) => {
    setStream(_stream);
  };

  const updateSelfPosition = (pos) => {
    selfPositionRef.current = pos;
    setSelfPosition(pos);
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
  const onNewJoin = ({ name, id }) => {
    setAnnouncement(name + " has joined the room!");
    setNotificationTheme("join");
    // if the id is not self, configure the new user and send offer
    setShowNotification(true);
    if (id != socket.id) {
      addNewPeer(id);
      updateAllTracks(stream.getAudioTracks()[0]);
      broadcastOffer(socket);
    }
  };

  // add a new position array in the peerPositions state
  // set the user setPosition callback to change the state
  // add the user
  const addNewPeer = (userId) => {
    const peerProcessor = new PeerProcessor(userId, socket, addAvatar(userId), addUserInfo(userId));
    peerProcessor.initialize(
      selfPositionRef.current,
      selfUserInfoRef.current,
      new AudioVisualizer(peerProcessor.onAudioActivity.bind(peerProcessor))
    );
    pushToNetwork(peerProcessor);
  };

  const onLeave = (id: string) => {
    removeFromNetwork(id);
    removeAvatar(id);
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
    requestNetworkInfo(socket);
    openJoinListener(socket, onNewJoin);
    openLeaveListener(socket, setAnnouncement, onLeave);
    openRequestUsersListener(name, socket, addNewPeer);
    updateVisualizer(new AudioVisualizer(onAudioActivity));
  }, []);

  useEffect(() => {
    updateAllTracks(stream.getAudioTracks()[0]);
    if (visualizerRef.current) {
      visualizerRef.current.setStream(stream);
    }
  }, [stream]);

  // update remote position when avatar is dragged
  useEffect(() => {
    broadcastData({ position: selfPositionRef.current });
  }, [selfPositionRef.current]);

  return (
    <RoomTemplate sideDrawerComponent={<>Hello</>}>
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
        <Div>
          <Text>Choose your audio input source.</Text>
          <DeviceSelector onSelect={onSelect} />
        </Div>
        <Div w="50%" p={{ x: "1.25rem", y: "1.25rem" }}>
          <AvatarCanvas
            selfUserInfo={selfUserInfoRef.current}
            setSelfUserInfo={updateSelfUserInfo}
            userInfos={Object.values(userInfos)}
            selfPosition={selfPositionRef.current}
            setSelfPosition={updateSelfPosition}
            positions={Object.values(peerPositions)}
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
