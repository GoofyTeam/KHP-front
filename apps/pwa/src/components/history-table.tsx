import { ArrowUp, ArrowDown } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

export type HistoryEntry = {
  id: string;
  type: "add" | "remove";
  quantity: number;
  date: string;
};

interface HistoryTableProps {
  data: HistoryEntry[];
  className?: string;
  showHeader?: boolean;
  limitHeight?: boolean;
}

export function HistoryTable({
  data,
  className,
  showHeader = true,
  limitHeight = true,
}: HistoryTableProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="border overflow-hidden">
        <div
          className={cn(
            limitHeight &&
              "max-h-[15vh] [@media(min-height:600px)]:max-h-[20vh] [@media(min-height:700px)]:max-h-[25vh] [@media(min-height:800px)]:max-h-[30vh] overflow-y-auto"
          )}
        >
          <Table>
            {showHeader && (
              <TableHeader className="sticky top-0  bg-background">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {data.length ? (
                data.map((entry, index) => (
                  <TableRow
                    key={entry.id}
                    className={cn(index === data.length - 1 && "border-b-0")}
                  >
                    <TableCell className="flex justify-center w-[50px]">
                      {entry.type === "add" ? (
                        <ArrowUp className="h-5 w-5 text-khp-primary" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-khp-error" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.quantity} KG
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.date}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Aucun historique disponible.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
