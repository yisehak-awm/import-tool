import React from "react";
import { Handle, Position } from "@xyflow/react";

const handleStyle = { height: 20, width: 20 };

export function BasicNode({ data }) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <div className="bg-white border p-4 flex justify-center items-center rounded">
        <h5>{data.name}</h5>
      </div>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  );
}
