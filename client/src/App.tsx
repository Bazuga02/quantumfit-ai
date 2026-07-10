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
import WorkoutsPage from "@/pages/workouts-page";
import NutritionPage from "@/pages/nutrition-page";
import AICoachPage from "@/pages/ai-coach-page";
import SettingsPage from "@/pages/settings-page";
import WaterPage from "@/pages/water";
import ProgressPage from "@/pages/progress";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/workouts" component={WorkoutsPage} />
      <ProtectedRoute path="/nutrition" component={NutritionPage} />
      <ProtectedRoute path="/ai-coach" component={AICoachPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/water" component={WaterPage} />
      <ProtectedRoute path="/progress" component={ProgressPage} />
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
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
