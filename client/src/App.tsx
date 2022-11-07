import React from "react";
import Pages from "@/pages";
import { HomePage, TestPage } from "@/pages";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Providers from "@/contexts";

const App = (): JSX.Element => {
  return (
    <div>
      <Providers>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/test" component={TestPage} />
            <Route path="/:room_id" component={Pages} />
          </Switch>
        </BrowserRouter>
      </Providers>
    </div>
  );
};

export default App;
