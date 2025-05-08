import { useCallback, useContext, useEffect, useRef } from "react";
import Entity, { EntityData } from "./entity";
import Context from "./context";
import { nanoid } from "nanoid";
import Relation, {
  type Relation as RelationType,
  RelationData,
} from "./relation";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

const initialNodes: Node<EntityData>[] = [
  {
    id: "1",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      properties: {},
    },
  },
];

function Builder() {
  const { setIsValid, setSchema } = useContext(Context);
  const validationTimeoutRef = useRef(null);
  const { screenToFlowPosition, toObject } = useReactFlow();
  const [nodes, setNodes] = useNodesState<Node<EntityData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<RelationData>>(
    []
  );

  const handleNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      if (!updatedNodes.length) return;
      setNodes(updatedNodes);
    },
    [nodes, setNodes]
  );

  useEffect(() => {
    clearTimeout(validationTimeoutRef.current);
    validationTimeoutRef.current = setTimeout(() => {
      const hasNodeErrors = nodes.some((n) => hasTruthyValues(n.data.error));
      const hasEdgeErrors = edges.some((e) =>
        Object.values(e.data).some((v) => hasTruthyValues(v.error))
      );
      const isValid = !hasNodeErrors && !hasEdgeErrors;
      setIsValid(isValid);
      if (isValid) setSchema(toObject());
    }, 500);
    return () => {
      clearTimeout(validationTimeoutRef.current);
    };
  }, [nodes, edges]);

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
      if (!connectionState.isValid) {
        const id = nanoid();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode: Node<EntityData> = {
          id,
          type: "entity",
          origin: [0.5, 0.0],
          data: { properties: {} },
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
        };
        const edge = createEdge(connectionState.fromNode.id, id);
        setNodes((nds) => nds.concat(newNode as any));
        setEdges((eds) => eds.concat(edge));
      }
    },
    [screenToFlowPosition]
  );

  return (
    <div className="schema-builder-wrapper h-full w-full">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        nodeTypes={{ entity: Entity }}
        edgeTypes={{ relation: Relation }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }}
      />
      <Controls />
      <Background
        patternClassName="sb-bg"
        variant={BackgroundVariant.Dots}
        gap={12}
        size={1}
      />
    </div>
  );
}

function hasTruthyValues(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key]) {
      return true;
    }
  }
  return false;
}

function createEdge(source, target) {
  const edge: RelationType = {
    id: nanoid(),
    type: "relation",
    source,
    target,
    data: {
      [nanoid()]: { properties: {} },
    },
  };
  return edge;
}

export default function SchemaBuilder() {
  return (
    <ReactFlowProvider>
      <Builder />
    </ReactFlowProvider>
  );
}
