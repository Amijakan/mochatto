import React, { ReactElement } from "react";
import { SocketContext, SocketProvider } from "./SocketIOContext";
import { DeviceContext, DeviceProvider } from "./DeviceContext";
import { UserInfoContext, UserInfoProvider } from "./UserInfoContext";
import { PositionsContext, PositionsProvider } from "./PositionsContext";
import { ThemeProvider } from "atomize";

const theme = {
  fontFamily: {
    primary: "DM Sans, sans-serif",
  },
};

const Providers = ({ children }: { children: ReactElement }): JSX.Element => (
  <ThemeProvider theme={theme}>
    <SocketProvider>
      <PositionsProvider>
        <DeviceProvider>
          <UserInfoProvider>{children}</UserInfoProvider>
        </DeviceProvider>
      </PositionsProvider>
    </SocketProvider>
  </ThemeProvider>
);

export { DeviceContext, UserInfoContext, SocketContext };
export default Providers;
