import { Card, CardContent } from "@/components/ui/card";

export default function SalesSummaryCards({
  totalOrders,
  totalProducts,
  totalRevenue,
}: {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}) {
  const items = [
    { label: "Total Orders", value: totalOrders },
    { label: "Total Products", value: totalProducts },
    {
      label: "Total Revenue",
      value: `₹ ${totalRevenue.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((i) => (
        <Card key={i.label} className="border-muted shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{i.label}</p>
            <p className="text-2xl font-semibold mt-1">{i.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
