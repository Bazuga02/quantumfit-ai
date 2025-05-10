import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthForms } from "@/components/auth/auth-forms";
import { useAuth } from "@/hooks/use-auth";
import { Activity } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <div className="bg-primary text-white p-1 rounded">
              <Activity className="w-6 h-6" />
            </div>
            <span className="ml-2 text-2xl font-bold">QuantumFit AI</span>
          </div>
          <AuthForms />
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-primary text-white p-6 md:p-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Your Smart Fitness Companion</h1>
          <p className="text-lg mb-6">
            Track your workouts, nutrition, and progress with the power of AI to
            achieve your fitness goals faster.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Activity className="h-5 w-5" />
              </div>
              <span>Personalized workout plans</span>
            </li>
            <li className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Activity className="h-5 w-5" />
              </div>
              <span>Nutrition tracking & meal suggestions</span>
            </li>
            <li className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Activity className="h-5 w-5" />
              </div>
              <span>Progress visualization & insights</span>
            </li>
            <li className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Activity className="h-5 w-5" />
              </div>
              <span>AI-powered coaching & recommendations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
