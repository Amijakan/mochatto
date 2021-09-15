import React from "react";
import Pages from "./pages";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Providers from "./contexts";
import BaseTemplate from "./templates/BaseTemplate";

const App = (): JSX.Element => {
  return (
    <div>
      <Providers>
        <BrowserRouter>
          <BaseTemplate>
            <Switch>
              <Route path="/:room_id" component={Pages} />
            </Switch>
          </BaseTemplate>
        </BrowserRouter>
      </Providers>
    </div>
  );
};

export default App;
