import { ReactFlowProvider } from "@xyflow/react";
import { Tool } from "./builder";

export function ImportTool() {
  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex">
        <Tool />
      </div>
    </ReactFlowProvider>
  );
}
