import React, { useState, useEffect, useContext } from "react";
import { BaseTemplate } from "@/templates";
import { Button } from "@/components";
import { Div } from "atomize";
import { Text, Input } from "@/components/atomize_wrapper";
import { SocketContext } from "@/contexts";
import { useHistory } from "react-router-dom";
import { SIOChannel } from "@/shared/socketIO";
import "./style.scss";

const HomePage = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const [roomExists, setRoomExists] = useState(false);
  const [roomId, setRoomId] = useState("");
  const history = useHistory();
  const responsiveWidth = { xs: "80%", md: "40%" };

  useEffect(() => {
    if (socket) {
      socket.on(SIOChannel.NUM_USERS, (usersNum) => {
        if (usersNum === 0 || usersNum === null) {
          setRoomExists(false);
        } else {
          setRoomExists(true);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.emit(SIOChannel.NUM_USERS, "/" + roomId);
    }
  }, [roomId]);

  return (
    <BaseTemplate>
      <div className="view-container">
        <div className="title-text">
          Your open-source virtual meeting space
        </div>
        <div className="sub-text">
            A peer-to-peer voice chat app focused on simplicity.
        </div>
        <div className="action-items">
          <Input
            textAlign="center"
            placeholder="Room ID"
            type="text"
            name="name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                history.push(roomId);
                history.go(0);
              }
            }}
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          />
          <div className="submit-button-container">
            <Button
              className="primary"
              onClick={() => {
                history.push(roomId);
                history.go(0);
              }}
            >
              {roomExists ? "Join" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
};

export default HomePage;
