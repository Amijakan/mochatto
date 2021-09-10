import React, { createContext, useReducer, useCallback } from "react";

interface PeerPosition {
  [key: string]: [number, number];
}

interface Action {
  type: string;
  id: string;
  position: [number, number];
}

export const PositionsContext = createContext<any>({});

export const PositionsProvider = ({ children }: { children: any }) => {
  const reducer = (peerPositions: PeerPosition, action: Action) => {
    switch (action.type) {
      case "add":
        return { ...peerPositions, [action.id]: action.position };
      default:
        return peerPositions;
    }
  };
  const [peerPositions, dispatch] = useReducer<React.Reducer<PeerPosition, Action>>(reducer, {});
  const addPositions = useCallback(
    (userId: string) => (position: [number, number]) => {
      dispatch({ type: "add", position: position, id: userId });
    },
    []
  );
  return (
    <PositionsContext.Provider
      value={{
        peerPositions: peerPositions,
        addPositions: addPositions,
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
};