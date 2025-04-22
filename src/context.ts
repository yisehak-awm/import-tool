import { createContext } from "react";
import { DataSource } from "./schema-builder/import-tool";

interface ContextData {
  dataSources: DataSource[];
  setDataSources: Function;
  isValid: boolean;
  setIsValid: Function;
}

const defaultValues: ContextData = {
  dataSources: [],
  setDataSources: () => {},
  isValid: false,
  setIsValid: () => {},
};

export const Context = createContext<ContextData>(defaultValues);
