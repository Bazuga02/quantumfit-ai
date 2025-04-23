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
import { WorkoutDetail } from "@/components/workouts/workout-detail";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<any>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

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
        { 
          exercise: { 
            id: 1,
            name: "Bench Press", 
            description: "A compound chest exercise performed on a flat bench",
            muscleGroups: ["chest", "triceps", "shoulders"],
            equipment: ["barbell", "bench"],
            difficulty: "intermediate",
            instructions: [
              "Lie on a flat bench with feet flat on the floor",
              "Grip the barbell slightly wider than shoulder width",
              "Lower the bar to your mid-chest",
              "Press the bar back up to the starting position"
            ],
          },
          sets: 4, 
          reps: 10, 
          restTime: 60,
          order: 1 
        },
        { 
          exercise: { 
            id: 2,
            name: "Shoulder Press", 
            description: "A compound shoulder exercise that targets deltoids",
            muscleGroups: ["shoulders", "triceps"],
            equipment: ["dumbbells", "barbell"],
            difficulty: "intermediate",
            instructions: [
              "Sit on a bench with back support",
              "Hold dumbbells at shoulder height with palms facing forward",
              "Press the weights up until your arms are fully extended",
              "Lower the weights back to the starting position"
            ],
          },
          sets: 3, 
          reps: 12, 
          restTime: 60,
          order: 2 
        },
        { 
          exercise: { 
            id: 3,
            name: "Tricep Extensions", 
            description: "An isolation exercise that targets the triceps",
            muscleGroups: ["triceps"],
            equipment: ["dumbbell", "cable"],
            difficulty: "beginner",
            instructions: [
              "Hold a dumbbell with both hands above your head",
              "Lower the weight behind your head by bending at the elbows",
              "Extend your arms to raise the weight back to starting position",
              "Keep your upper arms stationary throughout the movement"
            ],
          },
          sets: 3, 
          reps: 15, 
          restTime: 60,
          order: 3 
        }
      ]
    },
    {
      id: 2,
      name: "Lower Body Power",
      description: "Leg day focusing on strength and power development.",
      duration: 50,
      difficulty: "advanced",
      exercises: [
        { 
          exercise: { 
            id: 4,
            name: "Squats", 
            description: "A compound lower body exercise",
            muscleGroups: ["quadriceps", "hamstrings", "glutes"],
            equipment: ["barbell", "squat rack"],
            difficulty: "intermediate",
            instructions: [
              "Position the barbell on your upper back",
              "Stand with feet shoulder-width apart",
              "Bend your knees and hips to lower your body",
              "Push through your heels to return to standing position"
            ],
          },
          sets: 4, 
          reps: 8, 
          restTime: 90,
          order: 1 
        },
        { 
          exercise: { 
            id: 5,
            name: "Deadlifts", 
            description: "A compound full-body exercise",
            muscleGroups: ["back", "glutes", "hamstrings"],
            equipment: ["barbell"],
            difficulty: "advanced",
            instructions: [
              "Stand with feet hip-width apart, barbell over mid-foot",
              "Bend at hips and knees to grasp the bar",
              "Lift the bar by extending hips and knees",
              "Lower the bar by hinging at the hips and bending the knees"
            ],
          },
          sets: 3, 
          reps: 8, 
          restTime: 90,
          order: 2
        },
        { 
          exercise: { 
            id: 6,
            name: "Lunges", 
            description: "A unilateral lower body exercise",
            muscleGroups: ["quadriceps", "hamstrings", "glutes"],
            equipment: ["dumbbells", "bodyweight"],
            difficulty: "beginner",
            instructions: [
              "Stand upright with feet together",
              "Take a step forward with one leg",
              "Lower your body until both knees are bent at 90 degrees",
              "Push off the front foot to return to the starting position"
            ],
          },
          sets: 3, 
          reps: 12, 
          restTime: 60,
          order: 3
        }
      ]
    },
    {
      id: 3,
      name: "Core Stability",
      description: "Core-focused workout to improve stability and strength.",
      duration: 30,
      difficulty: "beginner",
      exercises: [
        { 
          exercise: { 
            id: 7,
            name: "Planks", 
            description: "A core exercise that improves stability and strengthens the abdominals",
            muscleGroups: ["core", "shoulders"],
            equipment: ["bodyweight"],
            difficulty: "beginner",
            instructions: [
              "Get into a push-up position with forearms on the ground",
              "Align your body in a straight line from head to heels",
              "Keep your core tight and avoid arching your back",
              "Hold the position for the prescribed time"
            ],
          },
          sets: 3, 
          reps: 1, 
          duration: 60,
          restTime: 45,
          order: 1
        },
        { 
          exercise: { 
            id: 8,
            name: "Russian Twists", 
            description: "A rotational exercise that targets the obliques and core",
            muscleGroups: ["core", "obliques"],
            equipment: ["weight plate", "medicine ball"],
            difficulty: "intermediate",
            instructions: [
              "Sit on the floor with knees bent",
              "Lean back slightly, keeping your back straight",
              "Hold a weight at chest level",
              "Rotate your torso to touch the weight to the ground on each side"
            ],
          },
          sets: 3, 
          reps: 20, 
          restTime: 45,
          order: 2
        },
        { 
          exercise: { 
            id: 9,
            name: "Mountain Climbers", 
            description: "A dynamic core exercise that also provides cardiovascular benefits",
            muscleGroups: ["core", "shoulders", "hip flexors"],
            equipment: ["bodyweight"],
            difficulty: "beginner",
            instructions: [
              "Start in a push-up position",
              "Bring one knee toward your chest",
              "Quickly switch legs, like you're running in place",
              "Keep your hips down and core engaged throughout"
            ],
          },
          sets: 3, 
          reps: 1, 
          duration: 45,
          restTime: 30,
          order: 3
        }
      ]
    }
  ];

  // Use workoutPlans from API if available, otherwise fallback to sample data
  const displayedWorkouts = (workoutPlans && workoutPlans.length > 0) ? workoutPlans : sampleWorkouts;

  // Handler for starting a workout
  const handleStartWorkout = (workoutId: number) => {
    if (selectedWorkout) {
      // If we're in detail view, use the selected workout data directly
      const workoutSession = {
        id: Date.now(),
        planId: selectedWorkout.id,
        planName: selectedWorkout.name,
        startTime: new Date().toISOString(),
        userId: user?.id,
        exercises: selectedWorkout.exercises,
        inProgress: true
      };
      setActiveWorkoutSession(workoutSession);
    } else {
      // Otherwise, make the API call to get the workout plan data
      startWorkoutMutation.mutate(workoutId);
    }
  };

  // Handler for selecting a workout to view details
  const handleSelectWorkout = (workout: any) => {
    setSelectedWorkout(workout);
  };

  // Handler for going back to the workout list
  const handleBackToList = () => {
    setSelectedWorkout(null);
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

  // If a workout is selected, show the detailed view
  if (selectedWorkout) {
    return (
      <WorkoutDetail
        workout={selectedWorkout}
        onBack={handleBackToList}
        onStartWorkout={handleStartWorkout}
      />
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
                <Card key={workout.id} className="hover:shadow-md transition-shadow">
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
                        <span>3 exercises</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => handleSelectWorkout(workout)}
                      >
                        Details
                      </Button>
                      <Button 
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => handleStartWorkout(workout.id)}
                      >
                        <Play className="h-4 w-4" />
                        Start
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