import { ReactFlowJsonObject } from "@xyflow/react";
import { createContext } from "react";
import { Entity } from "./entity";
import { Relation } from "./relation";

export interface DataSource {
  id: string;
  file: File;
  columns: string[];
  sampleRow: string[];
}

export interface Schema extends ReactFlowJsonObject<Entity, Relation> {}

interface ContextData {
  dataSources: DataSource[];
  setDataSources: React.Dispatch<React.SetStateAction<DataSource[]>>;
  isValid: boolean;
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  schema: Schema | null;
  setSchema: React.Dispatch<React.SetStateAction<Schema>>;
}

const defaultValues: ContextData = {
  dataSources: [],
  setDataSources: () => {},
  isValid: false,
  setIsValid: () => {},
  schema: null,
  setSchema: () => {},
};

const Context = createContext<ContextData>(defaultValues);
export default Context;
