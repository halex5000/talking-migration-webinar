import React from "react";
import { UAParser } from "ua-parser-js";
import { useAppStore } from "../store/app";
import { useLDClient } from "launchdarkly-react-client-sdk";

export default function UserAgent() {
  const parser = new UAParser();
  const client = useLDClient();
  const browserInfo = parser.getResult();

  const addBrowserInfo = useAppStore((state) => state.addBrowserInfo);
  addBrowserInfo(browserInfo);

  const addTimezone = useAppStore((state) => state.addTimezone);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  addTimezone(timezone);

  const context = client?.getContext();

  console.log("context is:", context);

  if (context) {
    const updatedContext = {
      ...context,
      timezone,
    };

    client?.identify(updatedContext);
  }

  return <div />;
}
