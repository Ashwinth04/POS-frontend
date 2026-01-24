import { Badge } from "@/components/ui/badge"

type Row = { barcode: string; status: string; message: string }

export default function UploadResultTable({ rows }: { rows: Row[] }) {
  return (
    <table className="w-full text-sm border mt-4">
      <thead className="bg-muted">
        <tr>
          <th className="p-2 text-left">Barcode</th>
          <th>Status</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t">
            <td className="p-2">{r.barcode}</td>
            <td>
              <Badge variant={r.status === "FULFILLABLE" ? "default" : "destructive"}>
                {r.status}
              </Badge>
            </td>
            <td>{r.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
