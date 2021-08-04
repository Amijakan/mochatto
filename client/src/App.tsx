import React from "react";
import Pages from "./pages";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { SocketProvider } from "./SocketIOContext";

const App = () => {
  return (
    <div>
      <SocketProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/:room_id" component={Pages} />
          </Switch>
        </BrowserRouter>
      </SocketProvider>
    </div>
  );
};

export default App;
