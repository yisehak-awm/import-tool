import React, { useCallback } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BasicNode } from "./node";
import BasicEdge from "./edge";

const nodeTypes = {
  basic: BasicNode,
};

const edgeTypes = {
  basic: BasicEdge,
};

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { name: "Gene" },
    type: "basic",
  },
  {
    id: "2",
    position: { x: 400, y: 200 },
    data: { name: "Protein" },
    type: "basic",
  },
];
const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "basic",
  },
];

const defaultEdgeOptions = {
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: "#b1b1b7",
  },
};

export function Tool() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          defaultEdgeOptions={defaultEdgeOptions}
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </div>
    </ReactFlowProvider>
  );
}
