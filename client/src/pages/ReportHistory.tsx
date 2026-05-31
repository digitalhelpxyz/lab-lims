import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Share2, Printer } from "lucide-react";
import { toast } from "sonner";

export default function ReportHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "archived">("all");

  const { data: reports, isLoading } = trpc.reports.list.useQuery({ limit: 100, offset: 0 });

  const filteredReports = reports?.filter((report: any) => {
    const matchesSearch = searchTerm === "" || 
      report.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleDownload = (reportUrl: string) => {
    if (reportUrl) {
      window.open(reportUrl, "_blank");
      toast.success("Report download started");
    } else {
      toast.error("Report URL not available");
    }
  };

  const handlePrint = (reportUrl: string) => {
    if (reportUrl) {
      const printWindow = window.open(reportUrl, "_blank");
      if (printWindow) {
        printWindow.print();
      }
      toast.success("Print dialog opened");
    } else {
      toast.error("Report URL not available");
    }
  };

  const handleShare = (reportUrl: string) => {
    if (reportUrl) {
      navigator.clipboard.writeText(reportUrl);
      toast.success("Report link copied to clipboard");
    } else {
      toast.error("Report URL not available");
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
        <h1 className="text-3xl font-bold text-slate-900">Report History</h1>
        <p className="text-slate-600 mt-2">Search, view, and manage past reports</p>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="form-label">Search by Patient Name</label>
              <Input
                type="text"
                placeholder="Enter patient name..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Filter by Status</label>
              <div className="flex gap-2">
                {(["all", "pending", "completed", "archived"] as const).map((status) => (
                  <Button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "btn-primary" : "btn-secondary"}
                    size="sm"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map((report: any) => (
                <div key={report.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{report.patientName || "Unknown Patient"}</h3>
                        <Badge className={`badge-${report.status}`}>
                          {report.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>
                          <p className="text-xs text-slate-500">Report ID</p>
                          <p className="font-medium text-slate-900">#{report.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Order ID</p>
                          <p className="font-medium text-slate-900">#{report.orderId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Generated</p>
                          <p className="font-medium text-slate-900">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(report.reportUrl)}
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePrint(report.reportUrl)}
                        title="Print Report"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShare(report.reportUrl)}
                        title="Share Report"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-600 py-8">No reports found matching your criteria.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
