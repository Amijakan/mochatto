import React, { useState, useEffect, useContext } from "react";
import { BaseTemplate } from "@/templates";
import { Button } from "@/components";
import { Div } from "atomize";
import { Text, Input } from "@/components/atomize_wrapper";
import { SocketContext } from "@/contexts";
import { useHistory } from "react-router-dom";
import "./style.scss";

const HomePage = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const [roomExists, setRoomExists] = useState(false);
  const [roomId, setRoomId] = useState("");
  const history = useHistory();
  const responsiveWidth = { xs: "80%", md: "40%" };

  useEffect(() => {
    if (socket) {
      socket.on("NUM_USERS", (usersNum) => {
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
      socket.emit("NUM_USERS", "/" + roomId);
    }
  }, [roomId]);

  return (
    <BaseTemplate>
      <Div flexDir="column" d="flex" justify="space-around" p="5rem" align="center">
        <Text textColor="#212121" textAlign="center" textSize="5rem" textWeight="700">
          <Div>Your open-source</Div>
          <Div>virtual meeting space</Div>
        </Text>
        <Div p="3.5rem">
          <Text textColor="#404040" textAlign="center" textSize="2rem" textWeight="400">
            A peer-to-peer voice chat app focused on simplicity.
          </Text>
        </Div>
        <Div flexDir="column" p={{ b: "1rem" }} d="flex" justify="center" w={responsiveWidth}>
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
        </Div>
      </Div>
    </BaseTemplate>
  );
};

export default HomePage;
