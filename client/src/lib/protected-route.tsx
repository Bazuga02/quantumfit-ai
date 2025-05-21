import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !tokenExpiration) {
      return;
    }

    const expirationTime = parseInt(tokenExpiration);
    if (Date.now() >= expirationTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
    }
  }, []);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user is found, redirect to auth page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If user is authenticated, render the protected component
  return <Route path={path} component={Component} />;
}
