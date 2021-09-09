import React, { createContext, useReducer } from "react";

interface PeerPosition {
  [key: string]: [number, number];
}

interface ActionType {
  type: string;
  id: string;
  position: [number, number];
}

export const PositionsContext = createContext<any>({});

export const PositionsProvider = ({ children }: { children: any }) => {
  const reducer = (peerPositions: PeerPosition[], action: ActionType) => {
    switch (action.type) {
      case "add":
        return { ...peerPositions, [action.id]: action.position };
      default:
        return peerPositions;
    }
  };
  const [peerPositions, dispatch] = useReducer<any>(reducer, {});
  const addPositions = (userId: string) => (position: [number, number]) => {
    dispatch({ type: "add", position: position, id: userId });
  };
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
