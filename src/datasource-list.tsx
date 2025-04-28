import { FileSpreadsheet, MinusCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { DataSource } from "./context";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "../components/ui/accordion";

function DatasourceList(props: {
  dataSources: DataSource[];
  onRemove: (id: string) => void;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full px-4 pb-4 overflow-y-auto"
    >
      {props.dataSources.map((s) => (
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
                onClick={() => props.onRemove(s.id)}
              >
                <MinusCircle className="inline me-1" />
                Remove
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default DatasourceList;
