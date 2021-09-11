import React, { createContext, useReducer, useCallback } from "react";

interface PeerPosition {
  [key: string]: [number, number];
}

interface Action {
  type: string;
  id: string;
  position: [number, number];
}

interface IPositionsContext {
  peerPositions: PeerPosition;
  addPositions: (userId: string) => (position: [number, number]) => void;
}

const initialState: IPositionsContext = {
  peerPositions: {},
  addPositions: (_userId: string) => (_position: [number, number]) => {},
};

export const PositionsContext = createContext<IPositionsContext>(initialState);

export const PositionsProvider = ({ children }: { children: any }) => {
  // reducer for adding a avatar position to the list render
  const reducer = (peerPositions: PeerPosition, action: Action) => {
    switch (action.type) {
      case "add":
        return { ...peerPositions, [action.id]: action.position };
      default:
        return peerPositions;
    }
  };
  const [peerPositions, dispatch] = useReducer<React.Reducer<PeerPosition, Action>>(reducer, {});
  // dispatching the action for adding a position
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
