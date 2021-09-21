import React, { createContext, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthenticationContext = createContext<any>({});

export const AuthenticationProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [hash, setHash] = useState("");

  return (
    <AuthenticationContext.Provider
      value={{hash, setHash}}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
