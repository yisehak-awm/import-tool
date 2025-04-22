import { ReactFlowProvider } from "@xyflow/react";
import { Builder } from "./builder";
import { Button } from "../../components/ui/button";
import { FileSpreadsheet, MinusCircle, Play, Upload } from "lucide-react";
import { useContext, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { nanoid } from "nanoid";
import { Context } from "../context";
import logo from "../logo.png";

export interface DataSource {
  id: string;
  file: File;
  columns: string[];
  sampleRow: string[];
}

function Tool() {
  const { dataSources, setDataSources, isValid } = useContext(Context);
  const file = useRef<HTMLInputElement>(null);

  function handleFileUpload(e) {
    const fileList: FileList = e.target.files;
    const files: File[] = Array.from(fileList);

    files.forEach((file) => {
      if (!file) return;
      const reader = file.stream().getReader();
      const decoder = new TextDecoder();
      let result = "";

      const readNextLine = async () => {
        const { done, value } = await reader.read();
        if (done) return;

        result += decoder.decode(value, { stream: true });
        const lines = result.split("\n");
        if (lines.length < 2) return readNextLine();

        const sourceRecord = {
          id: nanoid(),
          file,
          columns: lines[0].split(","),
          sampleRow: lines[1].split(","),
        };

        setDataSources((s) => [...s, sourceRecord]);
      };

      readNextLine();
    });

    file.current.value = null;
  }

  function removeSource(id: string) {
    setDataSources((ss) => ss.filter((s) => s.id !== id));
  }

  return (
    <ReactFlowProvider>
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
            <Button
              variant="secondary"
              className="w-full mb-1"
              onClick={() => file.current.click()}
            >
              <Upload className="inline me-1" />
              Upload a data source
            </Button>
            <input
              type="file"
              ref={file}
              className="hidden"
              onChange={handleFileUpload}
              accept=".csv"
              multiple
            />
          </div>
          <Accordion
            type="single"
            collapsible
            className="w-full px-4 pb-4 overflow-y-auto"
          >
            {dataSources.map((s) => (
              <AccordionItem
                key={s.id}
                value={s.id}
                className="border rounded-lg mb-2 hover:border-foreground/50 border-b last:border-b"
              >
                <AccordionTrigger className="px-4">
                  <div className="flex items-center">
                    <FileSpreadsheet className="inline w-4 me-2" />
                    {s.file.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <dl className="block ps-8 mb-4">
                    {s.columns.map((c, i) => (
                      <div className="flex">
                        <dt className="font-bold me-2">{c}:</dt>
                        <dd>{s.sampleRow[i]}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="block text-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeSource(s.id)}
                    >
                      <MinusCircle className="inline me-1" />
                      Remove
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="w-full absolute bottom-0 p-4">
            <Button className="w-full shadow-lg" disabled={!isValid}>
              <Play className="inline me-1" /> Run import
            </Button>
          </div>
        </div>
        <div className="relative w-full h-full">
          <Builder />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export function ImportTool() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isValid, setIsValid] = useState<boolean>(false);

  return (
    <Context.Provider
      value={{ dataSources, setDataSources, isValid, setIsValid }}
    >
      <Tool />
    </Context.Provider>
  );
}
