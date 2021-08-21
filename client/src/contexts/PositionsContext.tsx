import React, { useState, createContext } from "react";

export const PositionsContext = createContext<any>({});

export const PositionsProvider = ({ children }: { children: any }) => {
  const [peerPositions, setPeerPositions] = useState<any>({});
  const addPositions = (userId: number) => (positions: any) => {
		setPeerPositions({ ...peerPositions, [userId]: positions });
  };
  return (
    <PositionsContext.Provider
      value={{
        peerPositions: peerPositions,
        setPeerPositions: setPeerPositions,
        addPositions: addPositions,
      }}
    >
      {children}
    </PositionsContext.Provider>
  );
};
