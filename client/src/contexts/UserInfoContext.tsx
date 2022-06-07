import React, { createContext, useReducer, useCallback } from "react";

export type Position = [number, number];

export type UserInfo = {
  id: string;
  name: string;
  avatarColor: {
    background: string;
    border: string;
  };
  multiplier: number;
  position: Position;
  active: boolean;
  mute: boolean;
};

export const defaultUserInfo: UserInfo = {
  id: "",
  name: "",
  avatarColor: { background: "rgb(0 0 0 / 0%)", border: "rgb(0 0 0 / 0%)" },
  multiplier: 0,
  position: [100, 100] as Position,
  active: true,
  mute: false,
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
        Object.keys(action.data).forEach((key) => {
          newInfo = { ...newInfo, [key]: action?.data[key] };
        });
        Object.keys(defaultUserInfo).forEach((key) => {
          if (newInfo[key] == undefined) {
            newInfo[key] = defaultUserInfo[key];
          }
        });
        return { ...userInfos, [action.id]: { ...newInfo, id: action.id } };
      }
      case "remove": {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [action.id]: _toRemove, ...removed } = userInfos;
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
