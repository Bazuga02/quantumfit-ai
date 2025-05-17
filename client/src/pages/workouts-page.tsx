import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Add type for response
interface ApiResponse {
  data: any;
  error?: string;
}

// Update the response handlers
const handleResponse = (res: ApiResponse) => {
  if (res.error) {
    toast({
      title: "Error",
      description: res.error,
      variant: "destructive",
    });
    return null;
  }
  return res.data;
};

// Update the error handler
const handleError = (e: Error) => {
  toast({
    title: "Error",
    description: e.message,
    variant: "destructive",
  });
};

export default function WorkoutsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<any>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("my-workouts");

  // Fetch user plans
  const { data: userPlansRaw, isLoading: isLoadingUserPlans } = useQuery({
    queryKey: ['/api/workout-plans', { isTemplate: false }],
    queryFn: () => apiRequest('GET', '/api/workout-plans?isTemplate=false').then(res => res.json()),
    enabled: !!user,
  });
  const userPlans = userPlansRaw as any[] | undefined;

  // Fetch templates
  const { data: templatesRaw, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/workout-plans', { isTemplate: true }],
    queryFn: () => apiRequest('GET', '/api/workout-plans?isTemplate=true').then(res => res.json()),
    enabled: !!user,
  });
  const templates = templatesRaw as any[] | undefined;

  const { data: exercisesRaw, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['/api/exercises'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/exercises');
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      return response.json();
    },
    enabled: !!user,
  });
  const exercises = exercisesRaw as any[] | undefined;

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
  const filteredExercises = Array.isArray(exercises)
    ? exercises.filter((exercise: any) =>
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
  const displayedWorkouts = Array.isArray(userPlans) && userPlans.length > 0 ? userPlans : sampleWorkouts;

  // Handler for starting a workout
  const handleStartWorkout = async (workoutId: number) => {
    let workoutData = selectedWorkout;
    if (!workoutData) {
      // Fetch workout plan and its exercises if not already selected
      const planRes = await apiRequest('GET', `/api/workout-plans/${workoutId}`);
      if (!planRes.ok) {
        toast({ title: 'Error', description: 'Failed to fetch workout plan.' });
        return;
      }
      const plan = await planRes.json();
      const exercisesRes = await apiRequest('GET', `/api/workout-plans/${workoutId}/exercises`);
      if (!exercisesRes.ok) {
        toast({ title: 'Error', description: 'Failed to fetch workout exercises.' });
        return;
      }
      const exercises = await exercisesRes.json();
      workoutData = { ...plan, exercises };
    }
    // Create the workout session object
    const workoutSession = {
      id: Date.now(),
      planId: workoutData.id,
      planName: workoutData.name,
      startTime: new Date().toISOString(),
      userId: user?.id,
      exercises: workoutData.exercises || [],
      inProgress: true
    };
    setActiveWorkoutSession(workoutSession);
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

  // Adopt template logic
  const adoptTemplate = async (templateId: number) => {
    // 1. Fetch template plan and its exercises
    const templateRes = await apiRequest('GET', `/api/workout-plans/${templateId}`);
    const template = await templateRes.json();
    const exercisesRes = await apiRequest('GET', `/api/workout-plans/${templateId}/exercises`);
    const exercises = await exercisesRes.json();

    // 2. Create a new user plan
    const newPlanRes = await apiRequest('POST', '/api/workout-plans', {
      name: template.name,
      description: template.description,
      duration: template.duration,
      difficulty: template.difficulty,
      schedule: template.schedule,
      isTemplate: false,
    });
    const newPlan = await newPlanRes.json();

    // 3. Copy exercises to new plan
    for (const ex of exercises) {
      await apiRequest('POST', `/api/workout-plans/${newPlan.id}/exercises`, {
        exerciseId: ex.exercise.id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        duration: ex.duration,
        restTime: ex.restTime,
        order: ex.order,
      });
    }
    toast({ title: 'Template adopted!', description: 'The template has been added to your plans.' });
    queryClient.invalidateQueries({ queryKey: ['/api/workout-plans'] });
    setActiveTab('my-workouts');
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
      <Tabs defaultValue="my-workouts" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="my-workouts">My Workouts</TabsTrigger>
            <TabsTrigger value="exercise-library">Exercise Library</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
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

        <TabsContent value="my-workouts">
          {isLoadingUserPlans || startWorkoutMutation.isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-60"></CardContent>
                </Card>
              ))}
            </div>
          ) : displayedWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedWorkouts.map((workout: any) => (
                <Card key={workout.id} className="group relative overflow-visible bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl hover:-translate-y-1">
                  <CardContent className="p-7 pb-6 flex flex-col h-full">
                    {/* Floating Difficulty Badge */}
                    <span className="absolute top-5 right-5 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 shadow text-gray-700 dark:text-gray-200 group-hover:bg-primary group-hover:text-white transition-colors">{workout.difficulty}</span>
                    {/* Icon */}
                    <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl mb-4 shadow-sm">
                      <Dumbbell className="h-7 w-7" />
                    </div>
                    {/* Title & Description */}
                    <h3 className="font-bold text-2xl mb-1 text-gray-900 dark:text-white">{workout.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-4 line-clamp-2">{workout.description}</p>
                    {/* Spacer */}
                    <div className="flex-1" />
                    {/* Bottom Bar */}
                    <div className="flex items-center justify-between gap-4 text-sm font-medium mb-4">
                      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                        <Timer className="h-4 w-4" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                        <Users className="h-4 w-4" />
                        <span>{workout.exercises?.length ?? 3} exercises</span>
                      </div>
                    </div>
                    {/* Details Button */}
                    <Button 
                      className="w-full bg-primary text-white font-semibold rounded-full py-2 mt-1 shadow-md hover:bg-primary/90 transition-colors"
                      onClick={() => handleSelectWorkout(workout)}
                    >
                      Details
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
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 h-14"></CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="space-y-2">
              {filteredExercises.map((exercise: any) => (
                <Card 
                  key={exercise.id} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedWorkout({
                    id: 999,
                    name: exercise.name,
                    description: exercise.description,
                    difficulty: exercise.difficulty || "intermediate",
                    duration: 0,
                    exercises: [{
                      exercise: {
                        ...exercise,
                        muscleGroups: exercise.muscleGroups,
                        videoUrl: exercise.videoUrl,
                        imageUrl: exercise.imageUrl
                      },
                      sets: 4,
                      reps: 10,
                      restTime: 60,
                      order: 1
                    }]
                  })}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.muscleGroups.join(", ")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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

        <TabsContent value="templates">
          {isLoadingTemplates ? (
            <div>Loading templates...</div>
          ) : templates && Array.isArray(templates) && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template: any) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-md bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 mr-1" />
                      <span>{template.duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{template.exercises ? template.exercises.length : 0} exercises</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => handleSelectWorkout(template)}
                      >
                        Details
                      </Button>
                      <Button 
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => adoptTemplate(template.id)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div>No templates found.</div>
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