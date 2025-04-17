import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Button } from "../../components/ui/button";
import { Trash } from "lucide-react";
import Form from "./form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";

const handleStyle = { height: 20, width: 10 };

export function BasicNode(props) {
  const label = props.data.name || "Untitled";
  const { deleteElements } = useReactFlow();

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
          <div className="bg-background border p-4 px-8 flex justify-center items-center rounded-lg font-mono">
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
              onClick={() => deleteElements({ nodes: [{ id: props.id }] })}
            >
              <Trash className="inline" />
            </Button>
          </div>
          <div className="bg-background shadow-lg border rounded-lg p-4">
            <Form id={props.id} data={props.data} element="node" />
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
