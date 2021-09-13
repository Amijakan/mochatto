import React from "react";
import Pages from "./pages";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketIOContext";
import { PositionsProvider } from "./contexts/PositionsContext";
import { DeviceProvider } from "./contexts/DeviceContext";
import { UserInfoProvider } from "./contexts/UserInfoContext";

const App = (): JSX.Element => {
  return (
    <div>
      <SocketProvider>
        <PositionsProvider>
          <DeviceProvider>
          <UserInfoProvider>
          <BrowserRouter>
            <Switch>
              <Route path="/:room_id" component={Pages} />
            </Switch>
          </BrowserRouter>
          </DeviceProvider>
          </UserInfoProvider>
        </PositionsProvider>
      </SocketProvider>
    </div>
  );
};

export default App;
