import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestOrders() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Test Orders</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage test orders for patients</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">Test order management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
