import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { apiRequest } from "@/lib/api";
import type { WorkoutPlan as WorkoutPlanType } from "@shared/schema";

export function WorkoutPlan() {
  const { user } = useAuth();
  
  const { data: workoutPlans, isLoading } = useQuery<WorkoutPlanType[]>({
    queryKey: ['/api/workout-plans'],
    queryFn: () => apiRequest('GET', '/api/workout-plans'),
    enabled: !!user,
  });

  // Get the next workout (either first workout or most relevant)
  const todayWorkout = workoutPlans && workoutPlans.length > 0 
    ? workoutPlans[0] 
    : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Today's Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-4">
            <p>Loading workout plan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!todayWorkout) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Today's Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-4">
            <p>No workout plans found. Create one to get started!</p>
            <Link href="/workouts">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-white w-full">
                Create Workout Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Workout</CardTitle>
          <Link href="/workouts">
            <Button variant="link" className="text-primary p-0 h-auto">
              View All Workouts
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {todayWorkout.name}
            </h3>
            <span className="text-sm bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 py-1 px-2 rounded">
              {todayWorkout.duration} min
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {todayWorkout.description}
          </p>
          
          <div className="space-y-3">
            {/* We'll need to fetch exercises for this workout plan */}
            <div className="flex items-center justify-center py-4">
              <Link href={`/workouts/${todayWorkout.id}`}>
                <Button variant="secondary">
                  View Workout Details
                </Button>
              </Link>
            </div>
          </div>
          
          <Link href={`/workouts/${todayWorkout.id}/start`}>
            <Button className="mt-4 bg-primary hover:bg-primary/90 text-white w-full flex items-center justify-center gap-2">
              <Play className="h-4 w-4" />
              Start Workout
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
