import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Button } from "../../components/ui/button";
import { Trash } from "lucide-react";
import Form from "./form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { clsx } from "clsx";
import { useEffect, useMemo } from "react";
import { NodeData } from "./builder";

const handleStyle = { height: 20, width: 10 };

export function BasicNode({ id, data }: { id: string; data: NodeData }) {
  const { name, error, table, properties, primaryKey } = data;
  const label = name || "Untitled";
  const { deleteElements, updateNodeData } = useReactFlow();
  const hasError = useMemo(
    () => error && Object.values(error).some((e) => e),
    [data]
  );

  const wrapperClass = clsx({
    "border p-4 px-8 flex justify-center items-center rounded-lg font-mono":
      true,
    "bg-orange-500/5 border-orange-500 text-orange-500": hasError,
    "bg-green-500/5 border-green-500 text-green-500": !hasError,
  });

  useEffect(() => {
    const e = {};

    if (!name) {
      e["name"] = "Name required.";
    }

    if (!table) {
      e["table"] = "Table required.";
    }

    if (Object.values(properties).some((p) => p.checked && !p.type)) {
      e["properties"] = "Specify types for all selected properties.";
    }

    if (table && Object.values(properties).every((p) => !p.checked)) {
      e["properties"] = "Select atleast one property";
    }

    if (table && !primaryKey) {
      e["primaryKey"] = "Specify primary key.";
    }

    updateNodeData(id, { error: e });
  }, [name, table, properties, primaryKey]);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          ...handleStyle,
          left: -5,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRight: 0,
        }}
      />
      <Popover>
        <PopoverTrigger className="flex items-center flex-col">
          <div className={wrapperClass}>
            <h5>{label}</h5>
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          className="w-full border-0 shadow-none bg-transparent"
        >
          <div className="flex w-fit justify-end items-center bg-background shadow border rounded-lg mb-4">
            <Button
              variant="ghost"
              size="icon"
              className=" text-destructive"
              onClick={() => deleteElements({ nodes: [{ id }] })}
            >
              <Trash className="inline" />
            </Button>
          </div>
          <div className="bg-background shadow-lg border rounded-lg p-4">
            {hasError && (
              <div className="bg-red-500/5 border-destructive rounded-lg mb-4 p-8 py-2 text-destructive text-sm">
                <ul className="list-disc">
                  {Object.keys(error).map((k: string) =>
                    error[k] ? <li key={k}>{error[k]}</li> : null
                  )}
                </ul>
              </div>
            )}
            <Form id={id} data={data} element="node" />
          </div>
        </PopoverContent>
      </Popover>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          ...handleStyle,
          right: -5,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderLeft: 0,
        }}
      />
    </>
  );
}
