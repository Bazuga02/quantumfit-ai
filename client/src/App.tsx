import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import WaterPage from "@/pages/water-page";
import WorkoutsPage from "@/pages/workouts-page";
import NutritionPage from "@/pages/nutrition-page";
import ProgressPage from "@/pages/progress-page";
import AICoachPage from "@/pages/ai-coach-page";
import SettingsPage from "@/pages/settings-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/water" component={WaterPage} />
      <ProtectedRoute path="/workouts" component={WorkoutsPage} />
      <ProtectedRoute path="/nutrition" component={NutritionPage} />
      <ProtectedRoute path="/progress" component={ProgressPage} />
      <ProtectedRoute path="/ai-coach" component={AICoachPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
