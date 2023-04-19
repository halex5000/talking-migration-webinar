import { JsonViewer, NamedColorspace } from "@textea/json-viewer";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppStore } from "../store/app";

export const ocean: NamedColorspace = {
  scheme: "Ocean",
  author: "Chris Kempson (http://chriskempson.com)",
  base00: "#2b303b",
  base01: "#343d46",
  base02: "#4f5b66",
  base03: "#65737e",
  base04: "#a7adba",
  base05: "#c0c5ce",
  base06: "#dfe1e8",
  base07: "#eff1f5",
  base08: "#bf616a",
  base09: "#d08770",
  base0A: "#ebcb8b",
  base0B: "#a3be8c",
  base0C: "#96b5b4",
  base0D: "#8fa1b3",
  base0E: "#b48ead",
  base0F: "#ab7967",
};

export default function DataVisualizer() {
  const { databaseConnectionConfig, apiConnectionConfiguration } = useFlags();

  const launchDarklyClient = useLDClient();
  const browserInfo = useAppStore((state) => state.browserInfo);
  const timezone = useAppStore((state) => state.timezone);

  const [items, setItems] = useState({
    message: "no data yet",
    error: {},
  });

  let httpClient = axios.create({
    baseURL:
      apiConnectionConfiguration?.baseUrl ||
      "https://a7jovj7go9.execute-api.us-east-1.amazonaws.com/prod/v1",
    timeout: 1000,
  });

  let priorApiVersion: string;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const currentContext = launchDarklyClient?.getContext();
        const response = await httpClient.get("/items", {
          params: {
            ...browserInfo,
            timezone,
            key: currentContext?.key,
            name: currentContext?.name,
          },
        });
        setItems(response.data);
      } catch (error: any) {
        setItems({
          message: "error retrieving data from API",
          error: {
            data: error?.response?.data,
            status: error?.response?.status,
            headers: error?.response?.headers,
            request: error?.request,
            message: error?.message,
          },
        });
      }
    };

    if (apiConnectionConfiguration) {
      if (priorApiVersion === apiConnectionConfiguration.apiVersion) {
        fetchItems();
      } else {
        httpClient = axios.create({
          baseURL: apiConnectionConfiguration.baseUrl,
        });
        fetchItems();
      }
    }
  }, [databaseConnectionConfig, apiConnectionConfiguration]);

  return (
    <JsonViewer
      value={items}
      theme={ocean}
      sx={{
        textAlign: "left",
        width: "100%",
      }}
    />
  );
}
