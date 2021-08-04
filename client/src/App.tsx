import React from "react";
import Page from "./Page";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:4000";
const socket = socketIOClient(ENDPOINT);
const peerConnection = new RTCPeerConnection({
  iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
});

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route
            path="/:room_id"
            component={Page}
            socket={socket}
            peerConnection={peerConnection}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
