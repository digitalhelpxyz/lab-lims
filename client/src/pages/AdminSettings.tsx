import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Configure lab settings and branding</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lab Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">Admin settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
