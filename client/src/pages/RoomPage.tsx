import React, { useState, useRef, useEffect, useContext } from "react";
import { SocketContext, PositionsContext, DeviceContext, UserInfoContext } from "../contexts";
import { DeviceSelector } from "../components/DeviceSelector";
import { Div } from "atomize";
import AvatarCanvas from "../components/AvatarCanvas";
import {
  addUserToNetwork,
  removeUserFromNetwork,
  updateAllTracks,
  sendOffer,
  openOfferListener,
  openAnswerListener,
  getUsers,
  updateAvatarPositions,
} from "../classes/RTCPeerConnector";
import {
  requestNetworkInfo,
  openJoinListener,
  openLeaveListener,
  openRequestUsersListener,
} from "./RoomPageHelper";
import User from "../classes/User";
import { UserInfo, defaultUserInfo } from "../contexts/UserInfoContext";
import { AudioVisualizer, gainToMultiplier } from "../classes/AudioVisualizer";

import PropTypes from "prop-types";

function RoomPage({ name }: { name: string }): JSX.Element {
  const [announcement, setAnnouncement] = useState("");
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
    setAnnouncement(name + " has joined.");
    // if the id is not self, configure the new user and send offer
    if (id != socket.id) {
      setNewUser(id);
      updateAllTracks(stream.getAudioTracks()[0]);
      sendOffer(socket);
    }
  };

  // add a new position array in the peerPositions state
  // set the user setPosition callback to change the state
  // add the user
  const setNewUser = (userId) => {
    const user = new User(userId);
    user.setPosition = addAvatar(userId);
    user.setUserInfo = addUserInfo(userId);
    user.setSelfPosition(selfPositionRef.current);
    user.userInfo = selfUserInfoRef.current;
    user.visualizer = new AudioVisualizer(user.onAudioActivity.bind(user));
    addUserToNetwork(user);
  };

  const onLeave = (id: string) => {
    removeUserFromNetwork(id);
    removeAvatar(id);
    removeUserInfo(id);
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
    openRequestUsersListener(name, socket, setNewUser);
    openOfferListener(getUsers(), socket);
    openAnswerListener(getUsers(), socket);
    updateVisualizer(new AudioVisualizer(onAudioActivity));
  }, []);

  useEffect(() => {
    updateAllTracks(stream.getAudioTracks()[0]);
    sendOffer(socket);
    if (visualizerRef.current) {
      visualizerRef.current.setStream(stream);
    }
  }, [stream]);

  // update remote position when avatar is dragged
  useEffect(() => {
    updateAvatarPositions(selfPositionRef.current);
  }, [selfPosition]);

  return (
    <>
      <Div w="50%" p={{ x: "1.25rem", y: "1.25rem" }}>
        <DeviceSelector onSelect={onSelect} />
        <Div>{announcement}</Div>
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
  );
}

RoomPage.propTypes = {
  name: PropTypes.string,
};

export default RoomPage;
