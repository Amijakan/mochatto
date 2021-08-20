import React from "react";
import Pages from "./pages";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketIOContext";
import { PositionsProvider } from "./contexts/PositionsContext";

const App = (): JSX.Element => {
  return (
    <div>
      <SocketProvider>
        <PositionsProvider>
          <BrowserRouter>
            <Switch>
              <Route path="/:room_id" component={Pages} />
            </Switch>
          </BrowserRouter>
        </PositionsProvider>
      </SocketProvider>
    </div>
  );
};

export default App;
