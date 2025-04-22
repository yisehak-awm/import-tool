import { Button } from "../../components/ui/button";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
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
} from "../../components/ui/popover";
import { nanoid } from "nanoid";
import Form from "./form";
import { useEffect, useMemo } from "react";
import { EdgeData } from "./builder";
import { clsx } from "clsx";

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

  const isSelfClosing = props.source == props.target;
  const radiusX = (sourceX - targetX) * 0.4;
  const radiusY = 50;
  const offset = 100;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2 + offset;

  const selfConnectingedgePath = `M ${
    sourceX - 5
  } ${sourceY} A ${radiusX} ${radiusY} 0 0 1 ${midX} ${midY} A ${radiusX} ${radiusY} 0 0 1 ${
    targetX + 5
  } ${targetY}`;
  const { updateEdge, updateEdgeData } = useReactFlow();

  return (
    <>
      <BaseEdge
        id={id}
        path={isSelfClosing ? selfConnectingedgePath : edgePath}
      />
      <EdgeLabelRenderer>
        <div
          className="pointer-events-auto absolute"
          style={{
            transform: `translate(-50%, ${
              isSelfClosing ? 50 : 0
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
  const { updateEdge, deleteElements } = useReactFlow();
  const {
    name,
    reversed,
    error,
    table,
    properties,
    primaryKey,
    source,
    target,
  } = props.data as EdgeData[string];
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

  useEffect(() => {
    const e = {};

    if (!name) {
      e["name"] = "Name required.";
    }

    if (!table) {
      e["table"] = "Table required.";
    }

    if (
      properties &&
      Object.values(properties).some((p) => p.checked && !p.type)
    ) {
      e["properties"] = "Specify types for all selected properties.";
    }

    if (properties && Object.values(properties).every((p) => !p.checked)) {
      e["properties"] = "Select atleast one property";
    }

    if (table && !primaryKey) {
      e["primaryKey"] = "Specify primary key.";
    }

    if (table && !primaryKey) {
      e["primaryKey"] = "Specify primary key.";
    }

    if (table && !source) {
      e["source"] = "Specify source.";
    }

    if (table && !target) {
      e["target"] = "Specify target.";
    }

    props.onDataUpdate({ error: e });
  }, [name, reversed, table, properties, primaryKey, source, target]);

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
              updateEdge(props.edgeId, {
                data: {
                  ...props.data,
                  [props.id]: {
                    ...props.data[props.id],
                    reversed: !(reversed || false),
                  },
                },
              });
            }}
          >
            <ArrowLeftRight className="inline" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className=" text-destructive"
            onClick={() => {
              const { [props.id]: removed, ...rest } = props.data;
              if (!Object.keys(rest).length) {
                return deleteElements({
                  edges: [{ id: props.edgeId }],
                });
              }
              updateEdge(props.edgeId, {
                data: rest,
              });
            }}
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
          <Form
            id={props.edgeId}
            subid={props.id}
            data={props.data}
            element="edge"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
