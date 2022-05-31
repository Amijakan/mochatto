import React from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { StyleReset } from "atomize";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
// const debug = import.meta.env.MODE === "production" ? void 0 : new DebugEngine();
// 1. Create a client engine instance
const engine = new Styletron();

// 2. Provide the engine to the app
// debug engine needs inlined source maps
//
const container = document.getElementById("root")
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <StyletronProvider value={engine}>
      <StyleReset />
      <App />
    </StyletronProvider>
  </React.StrictMode>,
);
