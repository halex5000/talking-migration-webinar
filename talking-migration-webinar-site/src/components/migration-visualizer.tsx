import { Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Position,
  Edge,
  MarkerType,
} from "reactflow";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import "reactflow/dist/style.css";

export default function MigrationVisualizer() {
  const Label = ({ text }: { text: string }) => (
    <Container sx={{ justifyContent: "center" }}>
      <Typography variant="h5">{text}</Typography>
    </Container>
  );

  const beginningXPosition = 100;
  const beginningYPosition = 300;
  const apiXPosition = 350;
  const databaseXPosition = 700;
  const oldYPosition = 150;
  const newYPosition = 450;

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
      style: {
        lineHeight: 10,
      },
      markerEnd,
    },
    {
      id: "frontend-to-new-api",
      source: "1",
      target: "3",
      markerEnd,
    },
    {
      id: "old-api-to-old-database",
      source: "2",
      target: "5",
      animated: true,
      markerEnd,
    },
    {
      id: "new-api-to-new-database",
      source: "3",
      target: "4",
      animated: false,
      markerEnd,
    },
    {
      id: "new-api-to-old-database",
      source: "3",
      target: "5",
      animated: false,
      markerEnd,
    },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { databaseConnection, apiConnection } = useFlags();

  useEffect(() => {
    const updatedEdges = edges.map((edge) => {
      switch (edge.id) {
        case "frontend-to-old-api":
          edge.animated = apiConnection === "Old API";
          return edge;
        case "frontend-to-new-api":
          edge.animated = apiConnection === "New API";
          return edge;
        case "old-api-to-old-database":
          edge.animated = apiConnection === "Old API";
          return edge;
        case "new-api-to-new-database":
          edge.animated =
            apiConnection === "New API" &&
            databaseConnection === "New Database";
          return edge;
        case "new-api-to-old-database":
          edge.animated =
            apiConnection === "New API" &&
            databaseConnection === "Old Database";
          return edge;
        default:
          return edge;
      }
    });
    setEdges(updatedEdges);
  }, [databaseConnection, apiConnection]);

  return (
    <ReactFlow nodes={nodes} edges={edges}>
      <Background />
    </ReactFlow>
  );
}
