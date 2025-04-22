import { Label } from "../../components/ui/label";
import { useReactFlow } from "@xyflow/react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useContext, useEffect, useMemo } from "react";
import DataTable, { useDataTable } from "../../components/ui/data-table";
import { nanoid } from "nanoid";
import { ArrowRight, KeyRound } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { EdgeData, NodeData } from "./builder";
import { Context } from "../context";
import { Checkbox } from "../../components/ui/checkbox";
import { DataTablePagination } from "../../components/ui/data-table/pagination";

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
  const { dataSources } = useContext(Context);
  const { updateNodeData, updateEdgeData, getNode, getEdge } = useReactFlow();

  useEffect(() => {
    if (!dataSources.find((s) => s.id == data.table)) {
      updateData(id, { table: undefined });
    }
  }, [dataSources]);

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

  function handleTableChange(sourceId: string) {
    const columns = dataSources.find((s) => s.id === sourceId).columns;
    const properties: NodeData["properties"] = columns.reduce(
      (acc, curr) => ({ ...acc, [nanoid()]: { col: curr } }),
      {}
    );
    updateData(id, { table: sourceId, properties });
  }

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            Object.values(data.properties).every((p) => p.checked) ||
            (Object.values(data.properties).some((p) => p.checked) &&
              "indeterminate")
          }
          onCheckedChange={(value) => {
            const update = Object.keys(data.properties).reduce((acc, k) => {
              return {
                ...acc,
                [k]: { ...data.properties[k], checked: !!value },
              };
            }, {});
            updateData(id, {
              properties: update,
              primaryKey: !!value ? data.primaryKey : null,
            });
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.checked}
          onCheckedChange={(value) => {
            updateProperty(row.original.id, { checked: !!value });
            if (!value && data.primaryKey == row.original.id) {
              updateData(id, {
                primaryKey: null,
              });
            }
          }}
          aria-label="Select row"
        />
      ),
    },
    {
      id: "col",
      header: "Column",
      accessorKey: "col",
      cell: ({ row }) => (
        <span className="p-2 py-1 border rounded bg-muted/50 font-mono text-sm">
          {row.original.col}
        </span>
      ),
    },
    {
      id: "name",
      header: "Rename to",
      cell: ({ row }) => {
        const { col, name, id: propId } = row.original;
        return (
          <Input
            defaultValue={name}
            placeholder={col}
            onBlur={(e) => updateProperty(propId, { name: e.target.value })}
          />
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
            {/* <Button
              size="icon"
              variant="ghost"
              onClick={(e) => removeProperty(row.original.id)}
            >
              <Trash className="inline" />
            </Button> */}
            <Button
              size="icon"
              disabled={!row.original.checked}
              variant={
                data.primaryKey == row.original.id ? "default" : "outline"
              }
              onClick={() => updateData(id, { primaryKey: row.original.id })}
            >
              <KeyRound className="inline" />
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
        <Select
          value={data.table}
          onValueChange={handleTableChange}
          disabled={!dataSources?.length}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a table" />
          </SelectTrigger>
          <SelectContent>
            {dataSources.map((s) => (
              <SelectItem value={s.id}>{s.file.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!dataSources?.length && (
          <p className="text-orange-500 text-sm">Upload data sources first.</p>
        )}
      </div>
      {element === "edge" && data.table && (
        <div className="flex mb-4 items-end">
          <div>
            <Label className="mb-2">Source ID ({source})</Label>
            <Select
              value={(data as EdgeData[string]).source}
              onValueChange={(v) => updateData(id, { source: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem value={p.col}>{p.col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ArrowRight className="inline mb-2 mx-4" />
          <div>
            <Label className="mb-2">Target ID ({target})</Label>
            <Select
              value={(data as EdgeData[string]).target}
              onValueChange={(v) => updateData(id, { target: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem value={p.col}>{p.col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="flex flex-col ">
        {data.table && (
          <>
            <DataTable table={table} />
            <div className="mt-2 flex justify-between align-middle">
              <div className="flex-1 text-sm text-muted-foreground">
                {Object.values(data.properties).filter((p) => p.checked).length}{" "}
                selected
              </div>
              <DataTablePagination table={table} />
            </div>
          </>
        )}
        {/* <Button size="sm" variant="secondary" onClick={addProperty}>
          <Plus className="inline me-1" /> Add a property
        </Button> */}
      </div>
    </div>
  );
}

export default memo(Form);
