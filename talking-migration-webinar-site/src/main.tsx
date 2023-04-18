import React from "react";
import ReactDOM from "react-dom/client";
import { withLDProvider } from "launchdarkly-react-client-sdk";
import App from "./App";
import "./index.css";

const LaunchDarklyPoweredApp = withLDProvider({
  clientSideID: import.meta.env.VITE_LAUNCHDARKLY_CLIENT_SDK_KEY,
  context: {
    kind: "user",
    anonymous: true,
  },
})(App);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LaunchDarklyPoweredApp />
  </React.StrictMode>
);
