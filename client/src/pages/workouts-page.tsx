import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, ChevronRight, Dumbbell, Play, Plus, Search, Timer, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { WorkoutSession } from "@/components/workouts/workout-session";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<any>(null);

  const { data: workoutPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['/api/workout-plans'],
    enabled: !!user,
  });

  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['/api/exercises'],
    enabled: !!user,
  });

  // Start workout mutation
  const startWorkoutMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const res = await apiRequest("POST", `/api/workout-plans/${workoutId}/start`);
      return await res.json();
    },
    onSuccess: (workoutSession) => {
      setActiveWorkoutSession(workoutSession);
      toast({
        title: "Workout Started",
        description: `Starting ${workoutSession.planName}. Let's get moving!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start workout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtered exercises based on search term
  const filteredExercises = exercises
    ? exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Sample workout data (while loading from API)
  const sampleWorkouts = [
    {
      id: 1,
      name: "Upper Body Strength",
      description: "Focus on chest, shoulders and triceps with progressive overload.",
      duration: 45,
      difficulty: "intermediate",
      exercises: [
        { name: "Bench Press", sets: 4, reps: 10 },
        { name: "Shoulder Press", sets: 3, reps: 12 },
        { name: "Tricep Extensions", sets: 3, reps: 15 }
      ]
    },
    {
      id: 2,
      name: "Lower Body Power",
      description: "Leg day focusing on strength and power development.",
      duration: 50,
      difficulty: "advanced",
      exercises: [
        { name: "Squats", sets: 4, reps: 8 },
        { name: "Deadlifts", sets: 3, reps: 8 },
        { name: "Lunges", sets: 3, reps: 12 }
      ]
    },
    {
      id: 3,
      name: "Core Stability",
      description: "Core-focused workout to improve stability and strength.",
      duration: 30,
      difficulty: "beginner",
      exercises: [
        { name: "Planks", sets: 3, duration: "60 sec" },
        { name: "Russian Twists", sets: 3, reps: 20 },
        { name: "Mountain Climbers", sets: 3, duration: "45 sec" }
      ]
    }
  ];

  // Use workoutPlans from API if available, otherwise fallback to sample data
  const displayedWorkouts = (workoutPlans && workoutPlans.length > 0) ? workoutPlans : sampleWorkouts;

  // Handler for starting a workout
  const handleStartWorkout = (workoutId: number) => {
    startWorkoutMutation.mutate(workoutId);
  };

  // Handler for completing a workout
  const handleCompleteWorkout = () => {
    toast({
      title: "Workout Completed",
      description: "Great job! Your workout has been logged.",
    });
    setActiveWorkoutSession(null);
  };

  // Handler for exiting a workout
  const handleExitWorkout = () => {
    toast({
      title: "Workout Exited",
      description: "Your workout session has been ended.",
    });
    setActiveWorkoutSession(null);
  };

  // If there's an active workout session, show the workout session interface
  if (activeWorkoutSession) {
    return (
      <MainLayout 
        title="Active Workout" 
        subtitle={`Currently working out: ${activeWorkoutSession.planName}`}
      >
        <WorkoutSession 
          session={activeWorkoutSession}
          onComplete={handleCompleteWorkout}
          onExit={handleExitWorkout}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Workouts" 
      subtitle="Manage your workout plans and track your exercises."
    >
      <Tabs defaultValue="my-workouts" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="my-workouts">My Workouts</TabsTrigger>
            <TabsTrigger value="exercise-library">Exercise Library</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                New Workout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workout</DialogTitle>
                <DialogDescription>
                  Design a custom workout plan tailored to your goals.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Workout creation form goes here. This feature is coming soon!
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="my-workouts" className="space-y-6">
          {isLoadingPlans || startWorkoutMutation.isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-60"></CardContent>
                </Card>
              ))}
            </div>
          ) : displayedWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedWorkouts.map((workout) => (
                <Card key={workout.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {workout.difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{workout.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {workout.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 mr-1" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleStartWorkout(workout.id)}
                    >
                      <Play className="h-4 w-4" />
                      Start Workout
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Dumbbell className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">No workout plans found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first workout plan to get started
                  </p>
                  <Button>Create Workout Plan</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exercise-library">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search exercises..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoadingExercises ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-20"></CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="space-y-4">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.muscleGroups.join(", ")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">No exercises found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or check back later
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommended">
          <Card>
            <CardHeader>
              <CardTitle>AI Workout Recommendations</CardTitle>
              <CardDescription>
                Personalized workout suggestions based on your goals and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-muted-foreground">
                  Workout recommendations are coming soon!
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back later for personalized AI workout suggestions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
