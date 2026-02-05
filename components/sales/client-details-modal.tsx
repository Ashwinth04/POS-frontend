import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ClientDetailsModal({ clients }: { clients: any[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          View Clients
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Client Breakdown</DialogTitle>
        </DialogHeader>

        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Units Sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{c.clientName ?? "Walk-in"}</TableCell>
                <TableCell className="text-right">{c.totalProducts}</TableCell>
                <TableCell className="text-right">
                  ₹{c.totalRevenue.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
