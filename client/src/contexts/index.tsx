import React, { ReactElement } from "react";
import { SocketContext, SocketProvider } from "./SocketIOContext";
import { DeviceContext, DeviceProvider } from "./DeviceContext";
import { UserInfoContext, UserInfoProvider } from "./UserInfoContext";
import { PositionsContext, PositionsProvider } from "./PositionsContext";
import { AuthenticationContext, AuthenticationProvider } from "./AuthenticationContext";
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
        <AuthenticationProvider>
          <DeviceProvider>
            <UserInfoProvider>{children}</UserInfoProvider>
          </DeviceProvider>
        </AuthenticationProvider>
      </PositionsProvider>
    </SocketProvider>
  </ThemeProvider>
);

export { DeviceContext, PositionsContext, UserInfoContext, SocketContext, AuthenticationContext };
export default Providers;
