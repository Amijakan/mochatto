import React, { createContext, useState, useReducer, useCallback } from "react";

interface PeerPosition {
  [key: string]: [number, number];
}

interface Action {
  type: string;
  id: string;
  position: [number, number];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PositionsContext = createContext<any>({});

export const PositionsProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  // reducer for adding a avatar position to the list render
  const [spawnPoint, setSpawnPoint] = useState<[number, number]>([100, 100]);
  const reducer = (peerPositions: PeerPosition, action: Action) => {
    switch (action.type) {
      case "add":
        return { ...peerPositions, [action.id]: action.position };
      case "remove": {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [action.id]: _toRemove, ...removed } = peerPositions;
        return removed;
      }
      default:
        return peerPositions;
    }
  };
  const [peerPositions, dispatch] = useReducer<React.Reducer<PeerPosition, Action>>(reducer, {});
  // dispatching the action for adding a position
  const addAvatar = useCallback(
    (userId: string) => (position: [number, number]) => {
      dispatch({ type: "add", position: position, id: userId });
    },
    []
  );
  const removeAvatar = useCallback((userId: string) => {
    dispatch({ type: "remove", position: [0, 0], id: userId });
  }, []);

  const [selfPosition, setSelfPosition] = useState(spawnPoint);
  return (
    <PositionsContext.Provider
      value={{
        peerPositions,
        addAvatar,
        removeAvatar,
        selfPosition,
        setSelfPosition,
        spawnPoint,
        setSpawnPoint,
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
};
