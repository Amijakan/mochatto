import React, { useState, useEffect, useContext, SetStateAction, Dispatch } from "react";
import { SocketContext } from "../contexts/SocketIOContext";
import { PositionsContext } from "../contexts/PositionsContext";
import { UserInfoContext } from "../contexts/UserInfoContext";
import { DeviceSelector } from "../DeviceSelector";
import AvatarCanvas from "../AvatarCanvas";
import {
  addUserToNetwork,
  removeUserFromNetwork,
  updateAllTracks,
  sendOffer,
  openOfferListener,
  openAnswerListener,
  getUsers,
  updateAvatarPositions,
  updateUserInfo,
} from "../RTCPeerConnector";
import {
  notifyAndRequestNetworkInfo,
  openJoinListener,
  openLeaveListener,
  openRequestUsersListener,
} from "./RoomPageHelper";
import User from "../User";
import { UserInfo } from "../contexts/UserInfoContext";

import PropTypes from "prop-types";

function RoomPage({ name }: { name: string }): JSX.Element {
  const [announcement, setAnnouncement] = useState("");
  const { socket } = useContext(SocketContext);
  const [selfPosition, setSelfPosition] = useState<[number, number]>([0, 0]);
  const { peerPositions, addAvatar, removeAvatar } = useContext(PositionsContext);
  const [avatarColor, setAvatarColor] = useState<{ background: string; border: string }>({
    background: "black",
    border: "grey",
  });
  const [selfUserInfo, setSelfUserInfo] = useState<UserInfo>({ name, avatarColor });
  const { userInfos, addUserInfo, removeUserInfo } = useContext(UserInfoContext);

  // when new input is selected update all tracks and send a new offer out
  const onSelect = (stream) => {
    updateAllTracks(stream.getAudioTracks()[0]);
    sendOffer(socket);
  };

  // announce and set a new user on join
  const onJoin = ({ name, id }) => {
    setAnnouncement(name + " has joined.");
    if (id != socket.id) {
      setNewUser(id);
    }
  };

  // add a new position array in the peerPositions state
  // set the user setPosition callback to change the state
  // add the user
  const setNewUser = (userId) => {
    const user = new User(userId);
    user.setPosition = addAvatar(userId);
    user.setUserInfo = addUserInfo(userId);
    addUserToNetwork(user);
  };

  const onLeave = (id: string) => {
    removeUserFromNetwork(id);
    removeAvatar(id);
    removeUserInfo(id);
  };

  // open all listeners on render
  useEffect(() => {
    notifyAndRequestNetworkInfo(socket, name);
    openJoinListener(socket, onJoin);
    openLeaveListener(socket, setAnnouncement, onLeave);
    openRequestUsersListener(socket, setNewUser);
    openOfferListener(getUsers(), socket);
    openAnswerListener(getUsers(), socket);
  }, []);

  // update remote position when avatar is dragged
  useEffect(() => {
    updateAvatarPositions(selfPosition);
  }, [selfPosition]);

  useEffect(() => {
    console.debug(selfUserInfo);
    updateUserInfo(selfUserInfo);
  }, [selfUserInfo]);

  useEffect(() => {
    console.debug(userInfos);
  }, [userInfos]);

  return (
    <>
      <div>Room page</div>
      <div>Input selector</div>
      <DeviceSelector onSelect={onSelect} />
      <div>{announcement}</div>
      <AvatarCanvas
        selfUserInfo={selfUserInfo}
        setSelfUserInfo={setSelfUserInfo}
        userInfos={Object.values(userInfos)}
        selfPosition={selfPosition}
        setSelfPosition={setSelfPosition}
        positions={Object.values(peerPositions)}
      />
    </>
  );
}

RoomPage.propTypes = {
  name: PropTypes.string,
};

export default RoomPage;
