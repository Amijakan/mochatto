import React, { createContext, useReducer } from "react";

interface PeerPosition {
  [key: string]: [number, number];
}

interface State {
  peerPositions: PeerPosition[];
}

interface ActionType {
  type: string;
  id: string;
  position: [number, number];
}

export const PositionsContext = createContext<any>({});

export const PositionsProvider = ({ children }: { children: any }) => {
  const reducer = (state: State, action: ActionType) => {
    switch (action.type) {
      case "add":
        return { ...state.peerPositions, [action.id]: action.position };
      default:
        return peerPositions;
    }
  };
  const [peerPositions, dispatch] = useReducer(reducer, {});
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
