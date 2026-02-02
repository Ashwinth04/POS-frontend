import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SalesTable({
  columns,
  data,
}: {
  columns: string[];
  data: any[];
}) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((c) => (
                <TableCell key={c}>{row[c]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
