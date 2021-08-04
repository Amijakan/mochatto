import React, { createContext } from "react";
import Page from "./Page";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import socketIOClient from "socket.io-client";

export const SocketContext = createContext<{ socket: any; peerConnection: any }>({
  socket: null,
  peerConnection: null,
});

const SocketProvider = ({ children }) => {
  const ENDPOINT = "http://localhost:4000";
  const socket = socketIOClient(ENDPOINT);
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:iphone-stun.strato-iphone.de:3478" }],
  });

  return (
    <SocketContext.Provider value={{ socket, peerConnection }}>{children}</SocketContext.Provider>
  );
};

const App = () => {
  return (
    <div>
      <SocketProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/:room_id" component={Page} />
          </Switch>
        </BrowserRouter>
      </SocketProvider>
    </div>
  );
};

export default App;
