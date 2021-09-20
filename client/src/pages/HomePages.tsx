import React, { useState, useEffect, useContext } from "react";
import { BaseTemplate } from "../templates";
import { Div } from "atomize";
import { Button, Card, Text, Input } from "../components/atomize_wrapper";
import { SocketContext } from "../contexts";

const HomePage = (): JSX.Element => {
  const { socket } = useContext(SocketContext);
  const [roomExists, setRoomExists] = useState(false);
  const [roomId, setRoomId] = useState("");

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
        <Div flexDir="column" p={{ b: "1rem" }} d="flex" justify="center" w="30%">
          <Input
            textAlign="center"
            placeholder="Room ID"
            type="text"
            name="name"
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          />
        </Div>
        <Button
          w="30%"
          onClick={() => {
            console.log("hi");
          }}
        >
          {roomExists ? "Join" : "Create"}
        </Button>
      </Div>
    </BaseTemplate>
  );
};

export default HomePage;
