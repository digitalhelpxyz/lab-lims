import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Download, Share2 } from "lucide-react";

export default function ReportGeneration() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [doctorRemarks, setDoctorRemarks] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data: completedOrders, isLoading } = trpc.testOrders.getByPatient.useQuery({ patientId: 0 });
  const { data: orderDetails } = trpc.testOrders.getById.useQuery(
    { id: selectedOrderId || 0 },
    { enabled: !!selectedOrderId }
  );
  const generateReport = trpc.reports.create.useMutation();

  const handleGenerateReport = async () => {
    if (!selectedOrderId || !orderDetails) return;

    setGenerating(true);
    try {
      const result = await generateReport.mutateAsync({
        orderId: selectedOrderId,
        patientId: (orderDetails as any).patientId || 0,
        doctorRemarks: doctorRemarks || "",
      });
      toast.success("Report generated successfully!");
      setSelectedOrderId(null);
      setDoctorRemarks("");
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
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
        <h1 className="text-3xl font-bold text-slate-900">Generate Report</h1>
        <p className="text-slate-600 mt-2">Create professional lab reports with cloud upload</p>
      </div>

      {/* Order Selection */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Select Completed Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="form-label">Completed Test Orders</label>
              <Select value={selectedOrderId?.toString() || ""} onValueChange={(val) => setSelectedOrderId(parseInt(val))}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {completedOrders?.map((order: any) => (
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

      {/* Report Form */}
      {selectedOrderId && orderDetails && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Order ID</p>
                    <p className="font-medium text-slate-900">#{selectedOrderId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status</p>
                    <p className="font-medium text-green-600">Completed</p>
                  </div>
                </div>
              </div>

              {/* Doctor Remarks */}
              <div>
                <label className="form-label">Doctor Remarks (Optional)</label>
                <Textarea
                  value={doctorRemarks}
                  onChange={(e) => setDoctorRemarks(e.target.value)}
                  placeholder="Add any additional remarks or clinical notes..."
                  className="form-input min-h-32"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="btn-primary flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {generating ? "Generating..." : "Generate & Upload Report"}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setDoctorRemarks("");
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
      <Card className="card-outlined border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                Reports are automatically generated as PDF files with lab branding and uploaded to secure cloud storage.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                Shareable download links are created and stored in the database for easy patient/doctor access.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                Reports can be downloaded, printed, or shared directly from the report history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
