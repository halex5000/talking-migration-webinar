import { Container, Typography } from "@mui/material";
import { useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Position,
  Edge,
  MarkerType,
} from "reactflow";
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
  const oldYPosition = 100;
  const newYPosition = 500;

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
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    },
    {
      id: "3",
      data: { label: <Label text="New API" /> },
      position: { x: apiXPosition, y: newYPosition },
      type: "default",
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    },
    {
      id: "4",
      data: { label: <Label text="New Database" /> },
      position: { x: databaseXPosition, y: newYPosition },
      type: "output",
      targetPosition: Position.Left,
    },
    {
      id: "5",
      data: { label: <Label text="Old Database" /> },
      position: { x: databaseXPosition, y: oldYPosition },
      type: "output",
      targetPosition: Position.Left,
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      animated: true,
      markerEnd: {
        strokeWidth: 5,
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      markerEnd: {
        strokeWidth: 5,
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: "e2-4",
      source: "2",
      target: "4",
      animated: true,
      markerEnd: {
        strokeWidth: 5,
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: "e2-5",
      source: "2",
      target: "5",
      animated: false,
      markerEnd: {
        strokeWidth: 5,
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      animated: false,
      markerEnd: {
        strokeWidth: 5,
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: "e3-5",
      source: "3",
      target: "5",
      animated: false,
      markerEnd: {
        strokeWidth: 5,
        type: MarkerType.ArrowClosed,
      },
    },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <ReactFlow nodes={nodes} edges={edges}>
      <Background />
      {/* <Controls /> */}
    </ReactFlow>
  );
}
