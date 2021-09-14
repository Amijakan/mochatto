import React, { ReactElement } from "react";
import { SocketContext, SocketProvider } from "./SocketIOContext";
import { DeviceContext, DeviceProvider } from "./DeviceContext";
import { UserInfoContext, UserInfoProvider } from "./UserInfoContext";
import { PositionsContext, PositionsProvider } from "./PositionsContext";

const Providers = ({ children }: { children: ReactElement }): JSX.Element => (
  <SocketProvider>
    <PositionsProvider>
      <DeviceProvider>
        <UserInfoProvider>{children}</UserInfoProvider>
      </DeviceProvider>
    </PositionsProvider>
  </SocketProvider>
);

export { DeviceContext, PositionsContext, UserInfoContext, SocketContext };
export default Providers;
