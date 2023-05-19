import React, { ReactElement } from "react";
import { SocketContext, SocketProvider } from "./SocketIOContext";
import { DeviceContext, DeviceProvider } from "./DeviceContext";
import { UserInfoContext, UserInfoProvider } from "./UserInfoContext";
import { UserStreamContext, UserStreamProvider } from "./UserStreamContext";
import { ThemeProvider } from "atomize";

const theme = {
  fontFamily: {
    primary: "DM Sans, sans-serif",
  },
};

const Providers = ({ children }: { children: ReactElement }): JSX.Element => (
  <ThemeProvider theme={theme}>
    <SocketProvider>
      <DeviceProvider>
        <UserStreamProvider>
          <UserInfoProvider>{children}</UserInfoProvider>
        </UserStreamProvider>
      </DeviceProvider>
    </SocketProvider>
  </ThemeProvider>
);

export { DeviceContext, UserInfoContext, SocketContext, UserStreamContext };
export default Providers;
