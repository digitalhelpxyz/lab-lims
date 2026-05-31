import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Unauthorized() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">You do not have permission to access this page.</p>
        <Button onClick={() => setLocation("/dashboard")}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
