import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import { ArrowLeft, ArrowRight, Minus } from "lucide-react";

export default function BasicEdge(props) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <span
          className="pointer-events-auto absolute"
          style={{
            transform: `translate(-75%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <ul>
            <li>
              <Minus className="inline me-2" />
              expressed_in
              <ArrowRight className="ms-2 inline" />
            </li>
            <li>
              <ArrowLeft className="inline me-2" />
              produces <Minus className="inline ms-2" />
            </li>
            <li>
              <Minus className="inline me-2" />
              found_in
              <ArrowRight className="inline ms-2" />
            </li>
          </ul>
        </span>
      </EdgeLabelRenderer>
    </>
  );
}
