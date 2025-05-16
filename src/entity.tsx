import { Handle, Position, useReactFlow, Node, NodeProps } from "@xyflow/react";
import { Button } from "../components/ui/button";
import { useEffect, useMemo } from "react";
import { Trash } from "lucide-react";
import { clsx } from "clsx";
import Form from "./form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

const handleStyle = { height: 20, width: 10 };

export type EntityData = {
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
export type Entity = Node<EntityData>;
export default function Entity(props: NodeProps<Entity>) {
  const { deleteElements, updateNodeData } = useReactFlow();

  const { id, data } = props;
  const { name, error, table, properties, primaryKey } = data;
  const hasError = useMemo(
    () => error && Object.values(error).some((e) => e),
    [data]
  );
  const label = name || "Untitled";

  const wrapperClass = clsx({
    "border p-4 px-8 flex justify-center items-center rounded-lg font-mono":
      true,
    "bg-orange-500/5 border-orange-500 text-orange-500": hasError,
    "bg-green-500/5 border-green-500 text-green-500": !hasError,
  });

  function validate() {
    const e = {};
    const values = Object.values(properties);
    if (!name) e["name"] = "Name required.";
    if (!table) e["table"] = "Table required.";

    if (values.some((p) => p.checked && !p.type)) {
      e["properties"] = "Specify types for all selected properties.";
    }

    if (table && values.every((p) => !p.checked)) {
      e["properties"] = "Select atleast one property";
    }

    if (table && !primaryKey) e["primaryKey"] = "Specify primary key.";
    updateNodeData(id, { error: e });
  }

  useEffect(validate, [name, table, properties, primaryKey]);

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
          <div className="bg-background shadow-lg border rounded-lg p-4 max-h-[75vh] overflow-y-auto">
            {hasError && (
              <div className="bg-orange-500/5 rounded-lg mb-4 p-8 py-2 text-orange-500 text-sm">
                <ul className="list-disc">
                  {Object.keys(error).map((k: string) =>
                    error[k] ? <li key={k}>{error[k]}</li> : null
                  )}
                </ul>
              </div>
            )}
            <Form
              id={id}
              data={data}
              onUpdate={(update) => updateNodeData(id, update)}
            />
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
