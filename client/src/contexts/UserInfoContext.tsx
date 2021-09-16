import React, { createContext, useReducer, useCallback } from "react";

export interface UserInfo {
  name: string;
  avatarColor: {
    background: string;
    border: string;
  };
  multiplier: number;
}

export const defaultUserInfo = {
  name: "",
  avatarColor: { background: "gray", border: "black" },
  multiplier: 0,
};

interface Action {
  type: string;
  id: string;
  data: Partial<UserInfo>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserInfoContext = createContext<any>({});

export const UserInfoProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  // reducer for adding a avatar position to the list render
  const reducer = (userInfos: { [key: string]: UserInfo }, action: Action) => {
    switch (action.type) {
      case "add": {
        let newInfo = userInfos[action.id];
        console.log("UserContext:33, newInfo", newInfo);
        Object.keys(action.data).forEach((key) => {
          newInfo = { ...newInfo, [key]: action.data[key] };
        });
        return { ...userInfos, [action.id]: newInfo };
      }
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
    (userId: string) => (data: Partial<UserInfo>) => {
      dispatch({ type: "add", data, id: userId });
    },
    []
  );
  const removeUserInfo = useCallback((userId: string) => {
    dispatch({ type: "remove", data: {}, id: userId });
  }, []);
  return (
    <UserInfoContext.Provider value={{ userInfos, addUserInfo, removeUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
};
