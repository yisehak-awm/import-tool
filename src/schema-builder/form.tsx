import { Label } from "../../components/ui/label";
import { useReactFlow } from "@xyflow/react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import DataTable, { useDataTable } from "../../components/ui/data-table";
import { nanoid } from "nanoid";
import { ArrowRight, Plus, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { EdgeData, NodeData } from "./builder";

function Form({
  id,
  subid,
  data,
  element,
}: {
  id: string;
  subid?: string;
  data: NodeData | EdgeData[string];
  element: "node" | "edge";
}) {
  const { updateNodeData, updateEdgeData, getNode, getEdge } = useReactFlow();

  const updateData = useCallback(
    element === "node"
      ? updateNodeData
      : (id, update) => updateEdgeData(id, { [subid]: { ...data, ...update } }),
    [element, data]
  );

  const properties = useMemo(() => {
    const keys = Object.keys(data.properties);
    return keys.map((k) => ({ id: k, ...data.properties[k] }));
  }, [data]);

  const [source, target] = useMemo(() => {
    if (element == "node") return [null, null];
    const edge = getEdge(id);
    const source = getNode(edge.source).data.name as string;
    const target = getNode(edge.target).data.name as string;
    return (data as EdgeData[string]).reversed
      ? [target, source]
      : [source, target];
  }, [element, data]);

  function updateProperty(propId, update) {
    updateData(id, {
      properties: {
        ...data.properties,
        [propId]: { ...data.properties[propId], ...update },
      },
    });
  }

  function removeProperty(propId) {
    const { [propId]: _, ...otherProps } = data.properties;
    updateData(id, { properties: otherProps });
  }

  function addProperty() {
    updateData(id, {
      properties: {
        ...data.properties,
        [nanoid()]: {},
      },
    });
  }

  const columns: ColumnDef<any>[] = [
    {
      id: "name",
      header: "Property",
      cell: ({ row }) => {
        const { name, id: propId } = row.original;
        return (
          <Input
            defaultValue={name}
            placeholder="Untitled"
            onBlur={(e) => updateProperty(propId, { name: e.target.value })}
          />
        );
      },
    },
    {
      id: "col",
      header: "Column",
      cell: ({ row }) => {
        const { col, id: propId } = row.original;
        return (
          <Select
            defaultValue={col}
            onValueChange={(v) => updateProperty(propId, { col: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chr">chr</SelectItem>
              <SelectItem value="prt">prt</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "type",
      header: "Data type",
      cell: ({ row }) => {
        const { type, id: propId } = row.original;
        return (
          <Select
            defaultValue={type}
            onValueChange={(v) => updateProperty(propId, { type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="str">str</SelectItem>
              <SelectItem value="int">int</SelectItem>
              <SelectItem value="enum">enum</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="grid gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => removeProperty(row.original.id)}
            >
              <Trash className="inline" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useDataTable(columns as any, properties);

  return (
    <div className="min-w-96">
      <div className="mb-4">
        <Label className="mb-2">Name</Label>
        <Input
          defaultValue={data.name}
          placeholder="Untitled"
          onBlur={(e) => updateData(id, { name: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <Label className="mb-2">Table</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">table 1</SelectItem>
            <SelectItem value="2">table 2</SelectItem>
            <SelectItem value="3">table 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {element === "edge" && (
        <div className="flex mb-4 items-end">
          <div>
            <Label className="mb-2">Source ID ({source})</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">column 1</SelectItem>
                <SelectItem value="2">column 2</SelectItem>
                <SelectItem value="3">column 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ArrowRight className="inline mb-2 mx-4" />
          <div>
            <Label className="mb-2">Target ID ({target})</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">column 1</SelectItem>
                <SelectItem value="2">column 2</SelectItem>
                <SelectItem value="3">column 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex flex-col ">
        <DataTable table={table} />
        <Button size="sm" variant="secondary" onClick={addProperty}>
          <Plus className="inline me-1" /> Add a property
        </Button>
      </div>
    </div>
  );
}

export default memo(Form);
