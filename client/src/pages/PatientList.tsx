import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function PatientList() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: patients, isLoading } = trpc.patients.list.useQuery({ limit: 100 });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage patient records</p>
        </div>
        <Button onClick={() => setLocation("/patients/register")}>Register New Patient</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name or sample ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : patients && patients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Sample ID</th>
                    <th className="text-left p-3">Age</th>
                    <th className="text-left p-3">Phone</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-slate-100 dark:bg-slate-800">
                      <td className="p-3">{`${patient.firstName} ${patient.lastName}`}</td>
                      <td className="p-3">{patient.sampleId}</td>
                      <td className="p-3">{patient.age || "-"}</td>
                      <td className="p-3">{patient.phone || "-"}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">No patients found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
