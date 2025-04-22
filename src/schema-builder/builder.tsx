import { useCallback, useContext, useEffect, useRef } from "react";
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
import { Context } from "../context";

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
  error?: { [key: string]: string };
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
    error?: { [key: string]: string };
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
      error: {},
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

export function Builder() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge<EdgeData>>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const { setIsValid } = useContext(Context);
  const validationTimeoutRef = useRef(null);

  function hasTruthyProperties(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key]) {
        return true;
      }
    }
    return false;
  }

  useEffect(() => {
    clearTimeout(validationTimeoutRef.current);
    validationTimeoutRef.current = setTimeout(() => {
      setIsValid(
        !nodes.some((n) => hasTruthyProperties(n.data.error)) &&
          !edges.some((e) =>
            Object.values(e.data).some((v) => hasTruthyProperties(v.error))
          )
      );
    }, 500);
    return () => {
      clearTimeout(validationTimeoutRef.current);
    };
  }, [nodes, edges]);

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
