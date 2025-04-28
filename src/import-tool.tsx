import { useContext, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "../components/ui/button";
import Context, { DataSource, Schema } from "./context";
import SchemaBuilder from "./builder";
import DatasourceList from "./datasource-list";
import CSVuploader from "./csv-uploader";
import logo from "./logo.png";

function Tool() {
  const { dataSources, setDataSources, isValid, schema } = useContext(Context);

  function removeSource(id: string) {
    setDataSources((ss) => ss.filter((s) => s.id !== id));
  }

  return (
    <div className="h-screen w-screen flex">
      <div className="border-e w-[500px] relative h-full flex flex-col pb-16">
        <div className="px-4 mt-4">
          <div className="flex items-center">
            <img src={logo} className="w-10 h-10 me-4" />
            <div>
              <h4 className="font-bold ">Data import tool</h4>
              <p className="text-muted-foreground text-sm">
                Upload .csv data source files
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 my-2 flex flex-col items-center ">
          <CSVuploader />
        </div>
        <DatasourceList dataSources={dataSources} onRemove={removeSource} />
        <div className="w-full absolute bottom-0 p-4">
          <Button className="w-full shadow-lg" disabled={!isValid}>
            <Play className="inline me-1" /> Run import
          </Button>
        </div>
      </div>
      <div className="relative w-full h-full">
        <SchemaBuilder />
      </div>
    </div>
  );
}

export function ImportTool() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema>(null);

  return (
    <Context.Provider
      value={{
        dataSources,
        setDataSources,
        isValid,
        setIsValid,
        schema,
        setSchema,
      }}
    >
      <Tool />
    </Context.Provider>
  );
}
