import React from "react";
import Screen from "./Screen";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { SocketProvider } from "./SocketIOContext";

const App = () => {
  return (
    <div>
      <SocketProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/:room_id" component={Screen} />
          </Switch>
        </BrowserRouter>
      </SocketProvider>
    </div>
  );
};

export default App;
