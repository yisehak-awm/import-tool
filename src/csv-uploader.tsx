import { useContext, useRef } from "react";
import { nanoid } from "nanoid";
import Context from "./context";
import { Button } from "../components/ui/button";
import { Upload } from "lucide-react";

function CSVuploader() {
  const file = useRef<HTMLInputElement>(null);
  const { dataSources, setDataSources, isValid } = useContext(Context);

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

  return (
    <>
      <Button
        variant="secondary"
        className="w-full"
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
    </>
  );
}

export default CSVuploader;
