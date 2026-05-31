import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚕️</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">PathLab Portal</h1>
            </div>
            <a href={getLoginUrl()} className="text-accent hover:text-accent/80 font-medium">
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container py-20">
        <div className="max-w-3xl mx-auto text-center animate-slideInUp">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Laboratory Information Management System
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            A comprehensive, elegant solution for managing patient data, lab tests, and generating professional
            reports. Works seamlessly online and offline.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-professional">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-bold mb-2">Patient Registration</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Streamlined patient intake with comprehensive data capture
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-professional">
              <div className="text-4xl mb-3">🧪</div>
              <h3 className="font-bold mb-2">Test Management</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage test catalog, orders, and result entry with ease
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-professional">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-bold mb-2">PDF Reports</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate professional, branded reports with cloud storage
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-left shadow-professional">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔐</span>
                <h4 className="font-bold">Role-Based Access</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Admin, Lab Technician, and Receptionist roles</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-left shadow-professional">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📱</span>
                <h4 className="font-bold">Offline Support</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Progressive Web App with IndexedDB sync</p>
            </div>
          </div>

          <a href={getLoginUrl()}>
            <Button className="btn-primary px-8 py-3 text-lg">Get Started</Button>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t mt-20">
        <div className="container py-8 text-center text-slate-600 dark:text-slate-400 text-sm">
          <p>&copy; 2026 PathLab Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
