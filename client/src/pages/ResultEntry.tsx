import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export default function ResultEntry() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: orders, isLoading: ordersLoading } = trpc.testOrders.getByPatient.useQuery({ patientId: 0 });
  const { data: orderDetails } = trpc.testOrders.getById.useQuery(
    { id: selectedOrderId || 0 },
    { enabled: !!selectedOrderId }
  );
  const submitResults = trpc.testResults.create.useMutation();

  const handleSubmit = async () => {
    if (!selectedOrderId) return;

    setSubmitting(true);
    try {
      for (const [testId, value] of Object.entries(results)) {
        await submitResults.mutateAsync({
          orderId: selectedOrderId,
          testId: parseInt(testId),
          resultValue: value as string,
        });
      }
      toast.success("Results submitted successfully");
      setSelectedOrderId(null);
      setResults({});
    } catch (error) {
      toast.error("Failed to submit results");
    } finally {
      setSubmitting(false);
    }
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Result Entry</h1>
        <p className="text-slate-600 mt-2">Enter test results for pending orders</p>
      </div>

      {/* Order Selection */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Select Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="form-label">Pending Test Orders</label>
              <Select value={selectedOrderId?.toString() || ""} onValueChange={(val) => setSelectedOrderId(parseInt(val))}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {orders?.map((order: any) => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      Order #{order.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Entry Form */}
      {selectedOrderId && orderDetails && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Enter Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(orderDetails as any)?.tests?.map((test: any) => (
                <div key={test.id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{test.testName}</p>
                      <p className="text-sm text-slate-600">
                        Reference: {test.referenceRangeText || `${test.referenceRangeMin}-${test.referenceRangeMax}`} {test.unit}
                      </p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter result value"
                    className="form-input"
                    value={results[test.id] || ""}
                    onChange={(e) => setResults({ ...results, [test.id]: e.target.value })}
                  />
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? "Submitting..." : "Submit Results"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setResults({});
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      {!selectedOrderId && (
        <Card className="card-outlined border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                Select a pending order to enter test results. Results will be validated against reference ranges.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
