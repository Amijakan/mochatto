import React, { createContext, useState  } from "react";

interface UserInfo {
  name: string;
  color: string;
}
export const UserInfoContext = createContext<{ userInfo: UserInfo }>({
  userInfo: null as unknown as UserInfo,
});

export const UserInfoProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [userInfo, setUserInfo] = useState(null as unknown as UserInfo);

  return <UserInfoContext.Provider value={{ userInfo }}>{children}</UserInfoContext.Provider>;
};
