import { Button } from "../components/ui/button";
import { nanoid } from "nanoid";
import { useEffect, useMemo } from "react";
import { clsx } from "clsx";
import Form from "./form";
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Plus,
  Trash,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

export type RelationData = {
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
        name?: string;
        col: string;
        type: string;
        checked?: boolean;
      };
    };
  };
};

export type Relation = Edge<RelationData>;
export default function Relation(props: EdgeProps<Relation>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;
  const { updateEdge, updateEdgeData, deleteElements } = useReactFlow();
  const [path, labelX, labelY] = useMemo(() => {
    const radiusY = 50;
    const offset = 100;
    const radiusX = (sourceX - targetX) * 0.4;
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2 + offset;

    const [line, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    });

    if (props.source == props.target) {
      const loop = `M ${
        sourceX - 5
      } ${sourceY} A ${radiusX} ${radiusY} 0 0 1 ${midX} ${midY} A ${radiusX} ${radiusY} 0 0 1 ${
        targetX + 5
      } ${targetY}`;
      return [loop, labelX, labelY];
    }

    return [line, labelX, labelY];
  }, [sourceX, sourceY, targetX, targetY]);

  return (
    <>
      <BaseEdge id={id} path={path} />
      <EdgeLabelRenderer>
        <div
          className="pointer-events-auto absolute"
          style={{
            transform: `translate(-50%, ${
              props.source == props.target ? 50 : 0
            }px) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <ul className="text-center">
            {Object.keys(props.data).map((con) => {
              return (
                <li>
                  <ConnectionLabel
                    id={con}
                    key={con}
                    edgeId={id}
                    data={props.data[con]}
                    onDelete={() => {
                      const { [con]: removed, ...rest } = props.data;
                      if (!Object.keys(rest).length) {
                        return deleteElements({
                          edges: [{ id }],
                        });
                      }
                      updateEdge(id, {
                        data: rest,
                      });
                    }}
                    onDataUpdate={(update) => {
                      updateEdgeData(id, {
                        [con]: { ...props.data[con], ...update },
                      });
                    }}
                  />
                </li>
              );
            })}
            <li className="mt-2">
              <Button
                size="icon"
                variant="secondary"
                className="p-0 rounded-full"
                onClick={() =>
                  updateEdge(id, {
                    data: {
                      ...props.data,
                      [nanoid()]: {
                        properties: {},
                      },
                    },
                  })
                }
              >
                <Plus />
              </Button>
            </li>
          </ul>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function ConnectionLabel(props) {
  const { id, edgeId, data, onDataUpdate, onDelete } = props;
  const {
    name,
    reversed,
    error,
    table,
    properties,
    primaryKey,
    source,
    target,
  } = data as RelationData[string];
  const label = name || "Untitled";

  const hasError = useMemo(
    () => error && Object.values(error).some((e) => e),
    [error]
  );

  const wrapperClass = clsx({
    "text-xs hover:border-foreground bg-background p-1 px-2 rounded-lg border font-mono":
      true,
    "text-orange-500 border-orange-500": hasError,
    "text-green-500 border-green-500": !hasError,
  });

  function validate() {
    const e = {};
    const values = Object.values(properties);
    if (!name) e["name"] = "Name required.";
    if (!table) e["table"] = "Table required.";

    if (properties && values.some((p) => p.checked && !p.type)) {
      e["properties"] = "Specify types for all selected properties.";
    }

    if (properties && values.every((p) => !p.checked)) {
      e["properties"] = "Select atleast one property";
    }

    if (table && !primaryKey) e["primaryKey"] = "Specify primary key.";
    if (table && !primaryKey) e["primaryKey"] = "Specify primary key.";
    if (table && !source) e["source"] = "Specify source.";
    if (table && !target) e["target"] = "Specify target.";
    onDataUpdate({ error: e });
  }

  useEffect(validate, [
    name,
    reversed,
    table,
    properties,
    primaryKey,
    source,
    target,
  ]);

  return (
    <Popover>
      <PopoverTrigger>
        {reversed ? (
          <button className={wrapperClass}>
            <ArrowLeft size={16} className="inline me-2" />
            {label}
          </button>
        ) : (
          <button className={wrapperClass}>
            {label}
            <ArrowRight size={16} className="ms-2 inline" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        className="w-full border-0 shadow-none bg-transparent"
      >
        <div className="flex w-fit justify-end items-center bg-background shadow border rounded-lg mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onDataUpdate({ reversed: !(reversed || false) });
            }}
          >
            <ArrowLeftRight className="inline" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className=" text-destructive"
            onClick={onDelete}
          >
            <Trash className="inline" />
          </Button>
        </div>
        <div className="bg-background shadow-lg border rounded-lg p-4">
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
            id={edgeId}
            data={data}
            onUpdate={(update) => onDataUpdate(update)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
