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
  const { updateEdge, deleteElements } = useReactFlow();

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className="pointer-events-auto absolute"
          style={{
            transform: `translate(-75%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <ul className="text-center">
            {Object.keys(props.data).map((con) => {
              const label = props.data[con].name || "Untitled";
              return (
                <li>
                  <Popover>
                    <PopoverTrigger>
                      {props.data[con].reversed ? (
                        <button className="text-xs hover:border-foreground bg-background p-1 px-2 rounded-lg border font-mono">
                          <ArrowLeft size={16} className="inline me-2" />
                          {label}
                        </button>
                      ) : (
                        <button className="text-xs hover:border-foreground bg-background p-1 px-2 rounded-lg border font-mono">
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
                            updateEdge(id, {
                              data: {
                                ...props.data,
                                [con]: {
                                  ...props.data[con],
                                  reversed: !(
                                    props.data[con].reversed || false
                                  ),
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
                        >
                          <Trash className="inline" />
                        </Button>
                      </div>
                      <div className="bg-background shadow-lg border rounded-lg p-4">
                        <Form
                          id={id}
                          subid={con}
                          data={props.data[con]}
                          element="edge"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
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
