import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function GreetingCard() {
  const { user } = useAuth();
  
  const firstName = user?.name.split(" ")[0] || "there";

  return (
    <Card className="bg-primary text-white mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Ready for your workout, {firstName}?</h2>
            <p className="mt-1 text-primary-100">You're on track to hit your goals this week!</p>
            <div className="mt-4">
              <Link href="/workouts/start">
                <Button className="bg-white text-primary hover:bg-primary-50 font-medium shadow-sm">
                  Start Workout
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <Activity className="w-12 h-12 text-primary-100" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
