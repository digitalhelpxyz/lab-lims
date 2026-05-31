import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary } = trpc.dashboard.getDailySummary.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome, {user?.name}</p>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.totalPatients || 0}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{summary?.pendingTests || 0}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Awaiting results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary?.completedReports || 0}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Ready for delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {user?.role === "receptionist" && (
              <a href="/patients/register" className="p-4 border rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition">
                <div className="font-semibold">Register Patient</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Add new patient record</p>
              </a>
            )}
            {user?.role === "lab_technician" && (
              <>
                <a href="/tests/results" className="p-4 border rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition">
                  <div className="font-semibold">Enter Results</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Input test results</p>
                </a>
                <a href="/reports/generate" className="p-4 border rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition">
                  <div className="font-semibold">Generate Report</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Create lab report</p>
                </a>
              </>
            )}
            <a href="/reports/history" className="p-4 border rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition">
              <div className="font-semibold">View Reports</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Browse past reports</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
