import React, { createContext, useState } from "react";
import { Device } from "../components/DeviceSelectorHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DeviceContext = createContext<any>({});

export const DeviceProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [stream, setStream] = useState(new MediaStream());
  const [inputOptions, setInputOptions] = useState([{}]);
  const [selectedInput, setSelectedInput] = useState(Device());

  return (
    <DeviceContext.Provider
      value={{ stream, setStream, inputOptions, setInputOptions, selectedInput, setSelectedInput }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
