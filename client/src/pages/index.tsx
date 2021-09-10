import React, { useState } from "react";
import JoinPage from "./JoinPage";
import RoomPage from "./RoomPage";

const Pages = (): JSX.Element => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  return (
    <>
      {joined ? (
        <RoomPage name={name} />
      ) : (
        <JoinPage name={name} setName={setName} setJoined={setJoined} />
      )}
    </>
  );
};

export default Pages;
