import { Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Node,
  Position,
  Edge,
  MarkerType,
} from "reactflow";
import { useFlags } from "launchdarkly-react-client-sdk";
import "reactflow/dist/style.css";

export default function MigrationVisualizer() {
  const Label = ({ text }: { text: string }) => (
    <Container sx={{ justifyContent: "center" }}>
      <Typography variant="h5">{text}</Typography>
    </Container>
  );

  const beginningXPosition = 120;
  const beginningYPosition = 200;
  const apiXPosition = beginningXPosition + 250;
  const databaseXPosition = apiXPosition + 400;
  const oldYPosition = 50;
  const newYPosition = oldYPosition + 300;

  const markerEnd = {
    strokeWidth: 5,
    type: MarkerType.ArrowClosed,
    height: 20,
    width: 20,
  };

  const initialNodes: Node[] = [
    {
      id: "1",
      data: { label: <Label text="Front End" /> },
      position: { x: beginningXPosition, y: beginningYPosition },
      type: "input",
      style: {
        backgroundColor: "#455bff",
      },
      sourcePosition: Position.Right,
    },
    {
      id: "2",
      data: { label: <Label text="Old API" /> },
      position: { x: apiXPosition, y: oldYPosition },
      type: "default",
      style: {
        backgroundColor: "#A34FDE",
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    },
    {
      id: "3",
      data: { label: <Label text="New API" /> },
      position: { x: apiXPosition, y: newYPosition },
      type: "default",
      style: {
        backgroundColor: "#A34FDE",
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    },
    {
      id: "4",
      data: { label: <Label text="New Database" /> },
      position: { x: databaseXPosition, y: newYPosition },
      type: "output",
      style: {
        backgroundColor: "#3DD6F5",
      },
      targetPosition: Position.Left,
    },
    {
      id: "5",
      data: { label: <Label text="Old Database" /> },
      position: { x: databaseXPosition, y: oldYPosition },
      type: "output",
      style: {
        backgroundColor: "#3DD6F5",
      },
      targetPosition: Position.Left,
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: "frontend-to-old-api",
      source: "1",
      target: "2",
      animated: true,
      markerEnd,
      hidden: true,
    },
    {
      id: "old-api-to-old-database",
      source: "2",
      target: "5",
      animated: true,
      markerEnd,
      hidden: true,
    },
    {
      id: "frontend-to-new-api",
      source: "1",
      target: "3",
      animated: false,
      markerEnd,
      hidden: true,
    },
    {
      id: "new-api-to-new-database",
      source: "3",
      target: "4",
      targetHandle: "b",
      animated: false,
      markerEnd,
      hidden: true,
    },
    {
      id: "new-api-to-old-database",
      source: "3",
      target: "5",
      animated: false,
      markerEnd,
      hidden: true,
    },
    {
      id: "old-api-to-new-database",
      source: "2",
      target: "4",
      targetHandle: "a",
      animated: false,
      hidden: true,
    },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { databaseConnectionConfig, apiConnectionConfiguration } = useFlags();

  useEffect(() => {
    if (apiConnectionConfiguration && databaseConnectionConfig) {
      const updatedEdges = edges.map((edge) => {
        const isVersionOne = apiConnectionConfiguration.apiVersion === "v1";
        const isVersionTwo = apiConnectionConfiguration.apiVersion === "v2";
        const isDynamoDB = databaseConnectionConfig.dataSource === "DynamoDB";
        const isS3 = databaseConnectionConfig.dataSource === "S3";
        switch (edge.id) {
          case "frontend-to-old-api":
            edge.animated = isVersionOne;
            edge.hidden = !isVersionOne;
            return edge;
          case "frontend-to-new-api":
            edge.animated = isVersionTwo;
            edge.hidden = !isVersionTwo;
            return edge;
          // invalid configuration
          case "old-api-to-new-database":
            edge.animated = isVersionOne && isDynamoDB;
            edge.hidden = !isVersionOne || !isDynamoDB;
            edge.markerEnd = {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#FF0072",
            };
            edge.label = "unsupported configuration";
            edge.labelBgPadding = [15, 10];
            edge.style = {
              strokeWidth: 1,
              stroke: "#FF0072",
            };
            return edge;
          case "old-api-to-old-database":
            edge.animated = isVersionOne && isS3;
            edge.hidden = !isVersionOne || !isS3;
            return edge;
          case "new-api-to-new-database":
            edge.animated = isVersionTwo && isDynamoDB;
            edge.hidden = !isVersionTwo || !isDynamoDB;
            return edge;
          case "new-api-to-old-database":
            edge.animated = isVersionTwo && isS3;
            edge.hidden = !isVersionTwo || !isS3;
            return edge;
          default:
            return edge;
        }
      });
      setEdges(updatedEdges);
    }
  }, [databaseConnectionConfig, apiConnectionConfiguration]);

  return (
    <ReactFlow nodes={nodes} edges={edges}>
      <Background />
    </ReactFlow>
  );
}
