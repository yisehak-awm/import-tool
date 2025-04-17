import { createContext } from "react";
import { DataSource } from "./schema-builder/import-tool";

interface ContextData {
  dataSources?: DataSource[];
}

const defaultValues: ContextData = {
  dataSources: [],
};

export const Context = createContext<ContextData>(defaultValues);
