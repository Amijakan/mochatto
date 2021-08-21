import React, { useState, useEffect, useContext, SetStateAction, Dispatch } from "react";
import { SocketContext } from "../contexts/SocketIOContext";
import { PositionsContext } from "../contexts/PositionsContext";
import { DeviceSelector } from "../DeviceSelector";
import AvatarCanvas from "../AvatarCanvas";
import {
  addUser,
  removeUser,
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
  const [selfPosition, setSelfPosition] = useState<[number, number]>([0, 0]);
	const { peerPositions, setPeerPositions, addPositions } = useContext(PositionsContext);

  // when new input is selected
  const onSelect = (stream) => {
    updateAllTracks(stream.getAudioTracks()[0]);
    sendOffer(socket);
  };

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
    console.log(userId);
    user.setPosition = addPositions(userId);
    addUser(user);
  };

  useEffect(() => {
    console.log(peerPositions);
    notifyAndRequestNetworkInfo(socket, name);
    openJoinListener(socket, onJoin);
    openLeaveListener(socket, setAnnouncement, removeUser);
    openRequestUsersListener(socket, addUser, setNewUser);
    openOfferListener(getUsers(), socket);
    openAnswerListener(getUsers(), socket);
  }, []);

  useEffect(() => {
    updateAvatarPositions(selfPosition);
  }, [selfPosition]);

  useEffect(() => {
    console.log(peerPositions);
  }, [peerPositions]);

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
