import React, { createContext, useReducer, useCallback, useMemo } from "react";

export type UserStream = MediaStream | null;

interface Action {
  type: string;
  id: string;
  data: UserStream;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserStreamContext = createContext<any>({});

export const UserStreamProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const reducer = (userStreams: { [key: string]: UserStream }, action: Action) => {
    switch (action.type) {
      case "update": {
        return { ...userStreams, [action.id]: action.data };
      }
      case "remove": {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [action.id]: _toRemove, ...removed } = userStreams;
        return removed;
      }
      default:
        return userStreams;
    }
  };

  const [userStreams, dispatch] = useReducer<React.Reducer<{ [key: string]: UserStream }, Action>>(
    reducer,
    {}
  );

  const updateUserStream = useCallback(
    (userId: string) => (data: UserStream) => {
      dispatch({ type: "update", data, id: userId });
    },
    []
  );

  const removeUserStream = useCallback((userId: string) => {
    dispatch({ type: "remove", data: null, id: userId });
  }, []);

  return (
    <UserStreamContext.Provider value={{ userStreams, updateUserStream, removeUserStream }}>
      {children}
    </UserStreamContext.Provider>
  );
};
