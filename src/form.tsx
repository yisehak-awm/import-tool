import { DataTablePagination } from "../components/ui/data-table/pagination";
import DataTable, { useDataTable } from "../components/ui/data-table";
import { memo, useContext, useEffect, useMemo } from "react";
import { Checkbox } from "../components/ui/checkbox";
import { ArrowRight, KeyRound } from "lucide-react";
import { Relation, RelationData } from "./relation";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { useReactFlow } from "@xyflow/react";
import Context from "./context";
import { nanoid } from "nanoid";
import { EntityData } from "./entity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface FormProps {
  id: string;
  data: EntityData | RelationData[string];
  onUpdate: (update: any) => void;
}

function Form({ id, data, onUpdate }: FormProps) {
  const { getNode, getEdge } = useReactFlow();
  const { dataSources } = useContext(Context);
  const edge = useMemo(() => getEdge(id) as Relation, [id]);
  const reversed = edge && (data as RelationData[string]).reversed;

  const properties = useMemo(() => {
    const keys = Object.keys(data.properties);
    return keys.map((k) => ({ id: k, ...data.properties[k] }));
  }, [data]);

  const [source, target] = useMemo(() => {
    if (!edge) return [null, null];
    const source = getNode(edge.source).data.name as string;
    const target = getNode(edge.target).data.name as string;
    return reversed ? [target, source] : [source, target];
  }, [edge, reversed]);

  useEffect(() => {
    if (dataSources.find((s) => s.id == data.table)) return;
    onUpdate({ table: undefined, properties: {}, primaryKey: null });
  }, [dataSources]);

  function updateProperty(propId, update) {
    onUpdate({
      properties: {
        ...data.properties,
        [propId]: { ...data.properties[propId], ...update },
      },
    });
  }

  function handleTableChange(sourceId: string) {
    const columns = dataSources.find((s) => s.id === sourceId).columns;
    const properties = columns.reduce(
      (a, col) => ({ ...a, [nanoid()]: { col, checked: true, type: "text" } }),
      {}
    );
    onUpdate({ table: sourceId, properties });
  }

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            Object.values(data.properties).every((p) => p.checked) ||
            (Object.values(data.properties).some((p) => p.checked)
              ? "indeterminate"
              : false)
          }
          onCheckedChange={(value) => {
            const update = Object.keys(data.properties).reduce((acc, k) => {
              return {
                ...acc,
                [k]: { ...data.properties[k], checked: !!value },
              };
            }, {});
            onUpdate({
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
              onUpdate({
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
              <SelectItem value="text">text</SelectItem>
              <SelectItem value="int">int</SelectItem>
              <SelectItem value="double">double</SelectItem>
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
              disabled={!row.original.checked}
              variant={
                data.primaryKey == row.original.id ? "default" : "outline"
              }
              onClick={() => onUpdate({ primaryKey: row.original.id })}
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
          placeholder="Untitled"
          defaultValue={data.name}
          onBlur={(e) => onUpdate({ name: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <Label className="mb-2">Table</Label>
        <Select
          value={data.table}
          disabled={!dataSources?.length}
          onValueChange={handleTableChange}
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
      {edge && data.table && (
        <div className="flex mb-4 items-end">
          <div>
            <Label className="mb-2">Source ID ({source})</Label>
            <Select
              value={(data as RelationData[string]).source}
              onValueChange={(v) => onUpdate({ source: v })}
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
              value={(data as RelationData[string]).target}
              onValueChange={(v) => onUpdate({ target: v })}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(Form);
