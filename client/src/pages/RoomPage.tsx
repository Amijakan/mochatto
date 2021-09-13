import React, { useState, useRef, useEffect, useContext } from "react";
import { SocketContext } from "../contexts/SocketIOContext";
import { PositionsContext } from "../contexts/PositionsContext";
import { DeviceContext } from "../contexts/DeviceContext";
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
  const { stream, setStream } = useContext(DeviceContext);
  const { selfPosition, setSelfPosition, peerPositions, addAvatar, removeAvatar } =
    useContext(PositionsContext);
  const selfPositionRef = useRef(selfPosition);
  const [avatarColor, setAvatarColor] = useState<{ background: string; border: string }>({
    background: "black",
    border: "grey",
  });
  const [selfUserInfo, setSelfUserInfo] = useState<UserInfo>({ name, avatarColor });
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
    addUserToNetwork(user);
  };

  const onLeave = (id: string) => {
    removeUserFromNetwork(id);
    removeAvatar(id);
    removeUserInfo(id);
  };

  const printPack = (pack) => {
    console.debug(pack);
  };

  // open all listeners on render
  useEffect(() => {
    notifyAndRequestNetworkInfo(socket, name);
    openJoinListener(socket, onNewJoin);
    openLeaveListener(socket, setAnnouncement, onLeave);
    openRequestUsersListener(socket, setNewUser);
    openOfferListener(getUsers(), socket);
    openAnswerListener(getUsers(), socket);
  }, []);

  useEffect(() => {
    updateAllTracks(stream.getAudioTracks()[0]);
    sendOffer(socket);
  }, [stream]);

  // update remote position when avatar is dragged
  useEffect(() => {
    console.debug(selfPosition);
    updateAvatarPositions(selfPositionRef.current);
  }, [selfPosition]);

  useEffect(() => {
    updateUserInfo(selfUserInfoRef.current);
  }, [selfUserInfo]);

  return (
    <>
      <div>Room page</div>
      <div>Input selector</div>
      <DeviceSelector onSelect={onSelect} />
      <div>{announcement}</div>
      <AvatarCanvas
        selfUserInfo={selfUserInfoRef.current}
        setSelfUserInfo={updateSelfUserInfo}
        userInfos={Object.values(userInfos)}
        selfPosition={selfPositionRef.current}
        setSelfPosition={updateSelfPosition}
        positions={Object.values(peerPositions)}
      />
    </>
  );
}

RoomPage.propTypes = {
  name: PropTypes.string,
};

export default RoomPage;
