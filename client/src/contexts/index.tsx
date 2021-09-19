import React, { ReactElement } from "react";
import { SocketContext, SocketProvider } from "./SocketIOContext";
import { DeviceContext, DeviceProvider } from "./DeviceContext";
import { UserInfoContext, UserInfoProvider } from "./UserInfoContext";

const Providers = ({ children }: { children: ReactElement }): JSX.Element => (
  <SocketProvider>
    <DeviceProvider>
      <UserInfoProvider>{children}</UserInfoProvider>
    </DeviceProvider>
  </SocketProvider>
);

export { DeviceContext, UserInfoContext, SocketContext };
export default Providers;
