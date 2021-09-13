import React, { createContext, useState, useEffect } from "react";
import { Device } from "../DeviceSelectorHelper";

export const DeviceContext = createContext<any>({});

export const DeviceProvider = ({ children }: { children: JSX.Element }): JSX.Element => {
  const [stream, setStream] = useState(null as unknown as MediaStream);
  const [inputOptions, setInputOptions] = useState([{}]);
  const [selectedInput, setSelectedInput] = useState(Device());

  return <DeviceContext.Provider value={{ stream, setStream, inputOptions, setInputOptions, selectedInput, setSelectedInput }}>{children}</DeviceContext.Provider>;
};
