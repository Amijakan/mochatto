import React, { useState, useEffect, useContext, SetStateAction, Dispatch } from "react";
import { SocketContext } from "../contexts/SocketIOContext";
import { PositionsContext } from "../contexts/PositionsContext";
import { DeviceContext } from "../contexts/DeviceContext";
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
} from "../RTCPeerConnector";
import {
  notifyAndRequestNetworkInfo,
  openJoinListener,
  openLeaveListener,
  openRequestUsersListener,
} from "./RoomPageHelper";
import User from "../User";

import PropTypes from "prop-types";

function RoomPage({ name }: { name: string }): JSX.Element {
  const [announcement, setAnnouncement] = useState("");
  const { socket } = useContext(SocketContext);
  const { stream, setStream } = useContext(DeviceContext);
  const [selfPosition, setSelfPosition] = useState<[number, number]>([0, 0]);
  const { peerPositions, addAvatar, removeAvatar } = useContext(PositionsContext);

  // when new input is selected update all tracks and send a new offer out
  const onSelect = (_stream) => {
    setStream(_stream);
  };

  // announce and set a new user on join
  const onJoin = ({ name, id }) => {
    setAnnouncement(name + " has joined.");
    if (id != socket.id) {
      setNewUser(id);
      updateAllTracks(stream.getAudioTracks()[0]);
      sendOffer(socket);
    }   };

  // add a new position array in the peerPositions state
  // set the user setPosition callback to change the state
  // add the user
  const setNewUser = (userId) => {
    const user = new User(userId);
    user.setPosition = addAvatar(userId);
    addUserToNetwork(user);
  };

  const onLeave = (id: string) => {
    removeUserFromNetwork(id);
    removeAvatar(id);
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

  useEffect(() => {
    updateAllTracks(stream.getAudioTracks()[0]);
    sendOffer(socket);
  }, [stream]);

  // update remote position when avatar is dragged
  useEffect(() => {
    updateAvatarPositions(selfPosition);
  }, [selfPosition]);

  return (
    <>
      <div>Room page</div>
      <div>Input selector</div>
      <DeviceSelector onSelect={onSelect} />
      <div>{announcement}</div>
      <AvatarCanvas
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
