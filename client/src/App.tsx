import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Pages
import Dashboard from "./pages/Dashboard";
import PatientRegistration from "./pages/PatientRegistration";
import PatientList from "./pages/PatientList";
import TestCatalog from "./pages/TestCatalog";
import TestOrders from "./pages/TestOrders";
import ResultEntry from "./pages/ResultEntry";
import ReportGeneration from "./pages/ReportGeneration";
import ReportHistory from "./pages/ReportHistory";
import AdminSettings from "./pages/AdminSettings";
import Unauthorized from "./pages/Unauthorized";

function Router() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route><Redirect to="/login" /></Route>
      </Switch>
    );
  }

  const isAdmin = user?.role === "admin";
  const isLabTechnician = user?.role === "lab_technician" || isAdmin;
  const isReceptionist = user?.role === "receptionist" || isAdmin;

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" ><Redirect to="/dashboard" /></Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login"><Redirect to="/dashboard" /></Route>

        {(isReceptionist || isAdmin) && (
          <>
            <Route path="/patients/register" component={PatientRegistration} />
            <Route path="/patients" component={PatientList} />
          </>
        )}

        {(isLabTechnician || isAdmin) && (
          <>
            <Route path="/tests/catalog" component={TestCatalog} />
            <Route path="/tests/orders" component={TestOrders} />
            <Route path="/tests/results" component={ResultEntry} />
            <Route path="/reports/generate" component={ReportGeneration} />
            <Route path="/reports/history" component={ReportHistory} />
          </>
        )}

        {isAdmin && <Route path="/admin/settings" component={AdminSettings} />}

        <Route path="/unauthorized" component={Unauthorized} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
