import React, { createContext, useReducer, useCallback } from "react";

export interface UserInfo {
  name: string;
  avatarColor: {
    background: string;
    border: string;
  };
  multiplier;
}

export const defaultUserInfo = {
  name: "",
  avatarColor: { background: "gray", border: "black" },
  multiplier: 0,
};

interface Action {
  type: string;
  id: string;
  userInfo: UserInfo;
}

export const UserInfoContext = createContext<any>({});

export const UserInfoProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  // reducer for adding a avatar position to the list render
  const reducer = (userInfos: { [key: string]: UserInfo }, action: Action) => {
    switch (action.type) {
      case "add":
        return { ...userInfos, [action.id]: action.userInfo };
      case "remove": {
        const { [action.id]: _toRemove, ...removed } = userInfos;
        console.log(_toRemove);
        return removed;
      }
      default:
        return userInfos;
    }
  };
  const [userInfos, dispatch] = useReducer<React.Reducer<{ [key: string]: UserInfo }, Action>>(
    reducer,
    {}
  );
  // dispatching the action for adding a position
  const addUserInfo = useCallback(
    (userId: string) => (userInfo: UserInfo) => {
      dispatch({ type: "add", userInfo, id: userId });
    },
    []
  );
  const removeUserInfo = useCallback((userId: string) => {
    dispatch({ type: "remove", userInfo: null as unknown as UserInfo, id: userId });
  }, []);
  return (
    <UserInfoContext.Provider value={{ userInfos, addUserInfo, removeUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
};
