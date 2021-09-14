import Pages from "./pages";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Providers from "./contexts";

const App = (): JSX.Element => {
  return (
    <div>
      <Providers>
        <BrowserRouter>
          <Switch>
            <Route path="/:room_id" component={Pages} />
          </Switch>
        </BrowserRouter>
      </Providers>
    </div>
  );
};

export default App;
