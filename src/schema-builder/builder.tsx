import { useCallback } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { BasicNode } from "./node";
import BasicEdge from "./edge";
import { nanoid } from "nanoid";

const nodeTypes = {
  custom: BasicNode,
};

const edgeTypes = {
  custom: BasicEdge,
};

export type NodeData = {
  name?: string;
  table?: string;
  primaryKey?: string;
  properties: {
    [key: string]: {
      name: string;
      col: string;
      type: string;
      checked?: boolean;
    };
  };
};

export type EdgeData = {
  [key: string]: {
    name?: string;
    reversed?: boolean;
    table?: string;
    source?: string;
    target?: string;
    primaryKey?: string;
    properties: {
      [key: string]: {
        name: string;
        col: string;
        type: string;
        checked?: boolean;
      };
    };
  };
};

const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      properties: {},
    },
    type: "custom",
  },
];
const initialEdges: Edge<EdgeData>[] = [];

const defaultEdgeOptions = {
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
};

export function Tool() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge<EdgeData>>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  function createEdge(source, target) {
    const id = nanoid();
    const edge = {
      id,
      type: "custom",
      source,
      target,
      data: {
        [nanoid()]: { properties: {} },
      },
    };
    return edge;
  }

  const onConnect = useCallback(
    (params) => {
      const edge = createEdge(params.source, params.target);
      setEdges((eds) => [...eds, edge]);
      return edge;
    },
    [setEdges]
  );

  const onConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = nanoid();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode: Node<NodeData> = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          type: "custom",
          data: { properties: {} },
          origin: [0.5, 0.0],
        };
        setNodes((nds) => nds.concat(newNode as any));
        const edge = createEdge(connectionState.fromNode.id, id);
        setEdges((eds) => eds.concat(edge));
      }
    },
    [screenToFlowPosition]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
      />
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </div>
  );
}
