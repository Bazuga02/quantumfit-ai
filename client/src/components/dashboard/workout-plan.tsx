import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronRight, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function WorkoutPlan() {
  const { user } = useAuth();
  
  const { data: workoutPlans, isLoading } = useQuery({
    queryKey: ['/api/workout-plans'],
    enabled: !!user,
  });

  // Get the next workout (either first workout or most relevant)
  const todayWorkout = workoutPlans && workoutPlans.length > 0 
    ? workoutPlans[0] 
    : null;

  const exercises = [
    {
      name: "Bench Press",
      sets: 4,
      reps: 10,
    },
    {
      name: "Shoulder Press",
      sets: 3,
      reps: 12,
    },
    {
      name: "Tricep Extensions",
      sets: 3,
      reps: 15,
    }
  ];

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
              {todayWorkout?.name || "Upper Body Strength"}
            </h3>
            <span className="text-sm bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 py-1 px-2 rounded">
              45 min
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {todayWorkout?.description || "Focus on chest, shoulders and triceps with progressive overload."}
          </p>
          
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between ${
                  index < exercises.length - 1 ? "border-b border-gray-200 dark:border-gray-700 pb-2" : "pb-2"
                }`}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{exercise.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{exercise.sets} sets x {exercise.reps} reps</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
          
          <Link href="/workouts/start">
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
