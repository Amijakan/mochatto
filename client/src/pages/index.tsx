import React, { useState, useEffect } from "react";
import JoinPage from "./JoinPage";
import RoomPage from "./RoomPage";

const Pages = (): JSX.Element => {
  const [name, setName] = useState<string>(sessionStorage.getItem("username") || "");
  const [joined, setJoined] = useState<boolean>(false);
  useEffect(() => {
    console.log(sessionStorage.getItem("username"));
    if (joined && name) {
      sessionStorage.setItem("username", name);
    }
  }, [name, joined]);
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
