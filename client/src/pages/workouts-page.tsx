import { useState } from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import {
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Search,
  Timer,
  Users,
  Plus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function difficultyPillClass(difficulty: string) {
  const d = (difficulty || "").toLowerCase();
  if (d === "beginner") {
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300";
  }
  if (d === "advanced") {
    return "border-destructive/25 bg-destructive/10 text-destructive";
  }
  return "border-primary/30 bg-primary/15 text-primary";
}
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { WorkoutSession } from "@/components/workouts/workout-session";
import { WorkoutDetail } from "@/components/workouts/workout-detail";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<any>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("my-workouts");
  const [aiWorkoutDetail, setAiWorkoutDetail] = useState<any | null>(null);

  const { data: aiWorkoutRecommendationsRaw, isLoading: isLoadingAiWorkouts } = useQuery({
    queryKey: ["/api/ai/workout-recommendations"],
    queryFn: () => apiRequest("GET", "/api/ai/workout-recommendations").then((res) => res.json()),
    enabled: !!user,
  });
  const aiWorkoutRecommendations = (Array.isArray(aiWorkoutRecommendationsRaw)
    ? aiWorkoutRecommendationsRaw
    : []) as any[];

  // Fetch user plans
  const { data: userPlansRaw, isLoading: isLoadingUserPlans } = useQuery({
    queryKey: ['/api/workout-plans', { isTemplate: false }],
    queryFn: () => apiRequest('GET', '/api/workout-plans?isTemplate=false').then(res => res.json()),
    enabled: !!user,
  });
  const userPlans = userPlansRaw as any[] | undefined;


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
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to start workout" }));
        throw new Error(err.message || "Failed to start workout");
      }
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

  const handleStartWorkout = (workoutId: number) => {
    // Exercise-library previews use a synthetic id — start locally without API
    if (workoutId === 999 && selectedWorkout?.exercises?.length) {
      setActiveWorkoutSession({
        id: Date.now(),
        planId: selectedWorkout.id,
        planName: selectedWorkout.name,
        startTime: new Date().toISOString(),
        userId: user?.id,
        exercises: selectedWorkout.exercises,
        inProgress: true,
      });
      return;
    }
    startWorkoutMutation.mutate(workoutId);
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
        compact
        title="Active workout"
        subtitle={`You're in session: ${activeWorkoutSession.planName}. Finish sets at your pace — you can exit anytime.`}
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
      subtitle="Your plans, the exercise catalog, and saved AI sessions — pick a tab and start moving."
    >
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-8">
      <Tabs defaultValue="my-workouts" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-muted/60 p-1 dark:bg-muted/40 sm:w-auto sm:max-w-xl">
            <TabsTrigger
              value="exercise-library"
              className="gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Search className="hidden h-4 w-4 sm:inline" aria-hidden />
              <span className="truncate">Exercises</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-workouts"
              className="gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ClipboardList className="hidden h-4 w-4 sm:inline" aria-hidden />
              <span className="truncate">My workouts</span>
            </TabsTrigger>
            <TabsTrigger
              value="recommended"
              className="gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Sparkles className="hidden h-4 w-4 sm:inline" aria-hidden />
              <span className="truncate">Recommended</span>
            </TabsTrigger>
          </TabsList>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full gap-2 rounded-2xl shadow-md sm:w-auto">
                <Plus className="h-4 w-4" />
                New workout
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create workout</DialogTitle>
                <DialogDescription>
                  Custom plan builder is on the way. For now, start from AI Coach or use a template below.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-dashed border-border bg-muted/30 py-8 text-center dark:bg-muted/15">
                <p className="text-sm text-muted-foreground">
                  Coming soon — you&apos;ll be able to assemble blocks and save plans here.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="exercise-library" className="mt-0 space-y-6">
          <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
            <CardHeader className="border-b border-border/50 bg-muted/30 py-4 dark:bg-muted/15">
              <CardTitle className="text-lg font-bold text-foreground">Exercise library</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Tap a row to preview cues and equipment — great for quick reference between sets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-card p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name…"
                  className="h-11 rounded-2xl pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoadingExercises ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="animate-pulse rounded-2xl border-border/60">
                      <CardContent className="h-16 p-4" />
                    </Card>
                  ))}
                </div>
              ) : filteredExercises.length > 0 ? (
                <div className="space-y-3">
                  {filteredExercises.map((exercise: any) => (
                    <Card
                      key={exercise.id}
                      className="cursor-pointer rounded-2xl border-border/60 transition-colors hover:border-primary/25 hover:bg-muted/30"
                      onClick={() =>
                        setSelectedWorkout({
                          id: 999,
                          name: exercise.name,
                          description: exercise.description,
                          difficulty: exercise.difficulty || "intermediate",
                          duration: 0,
                          exercises: [
                            {
                              exercise: {
                                ...exercise,
                                muscleGroups: exercise.muscleGroups,
                                videoUrl: exercise.videoUrl,
                                imageUrl: exercise.imageUrl,
                              },
                              sets: 4,
                              reps: 10,
                              restTime: 60,
                              order: 1,
                            },
                          ],
                        })
                      }
                    >
                      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <Dumbbell className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{exercise.name}</p>
                            <p className="truncate text-xs text-muted-foreground sm:text-sm">
                              {exercise.muscleGroups.join(" · ")}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-12 text-center dark:bg-muted/10">
                  <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 font-medium text-foreground">No exercises match</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try another search term</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-workouts" className="mt-0 space-y-6">
          {isLoadingUserPlans || startWorkoutMutation.isPending ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse rounded-3xl border-border/60">
                  <CardContent className="h-64 p-6" />
                </Card>
              ))}
            </div>
          ) : userPlans && userPlans.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userPlans.map((workout: any) => (
                <Card
                  key={workout.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border-border/60 bg-card shadow-lg ring-1 ring-primary/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <CardContent className="flex h-full flex-col p-6 sm:p-7">
                    <span
                      className={cn(
                        "absolute right-5 top-5 z-10 rounded-full border px-3 py-1 text-xs font-semibold capitalize shadow-sm",
                        difficultyPillClass(workout.difficulty)
                      )}
                    >
                      {workout.difficulty}
                    </span>
                    <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
                      <Dumbbell className="h-6 w-6" />
                    </div>
                    <h3 className="pr-16 text-xl font-bold leading-snug tracking-tight text-foreground">
                      {workout.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {workout.description}
                    </p>
                    <div className="flex-1" />
                    <div className="mb-4 mt-5 flex items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Timer className="h-4 w-4 shrink-0 text-primary" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 shrink-0 text-primary" />
                        <span>{workout.exercises?.length ?? 0} moves</span>
                      </div>
                    </div>
                    <Button
                      className="w-full rounded-2xl font-semibold shadow-md"
                      onClick={() => handleSelectWorkout(workout)}
                    >
                      View plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center dark:bg-muted/10">
              <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-base font-medium text-foreground">No workout plans yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Plans from your account will list here. Use the Recommended tab after saving one from AI Coach, or check
                back when templates are available.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="default" className="rounded-2xl">
                  <Link href="/ai-coach">Open AI Coach</Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-2xl">
                      New workout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create workout</DialogTitle>
                      <DialogDescription>Custom builder is coming soon.</DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-0 space-y-6">
          <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
            <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
              <CardTitle className="text-xl font-bold">AI workout recommendations</CardTitle>
              <CardDescription className="text-base leading-relaxed text-primary-foreground/90">
                Plans you generated in AI Coach and saved with &quot;Save to My Workouts&quot; appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-card p-6">
              {isLoadingAiWorkouts ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading" />
                </div>
              ) : aiWorkoutRecommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center dark:bg-muted/10">
                  <Sparkles className="mb-3 h-12 w-12 text-primary/70" />
                  <p className="text-base font-medium text-foreground">No saved recommendations yet</p>
                  <p className="mt-2 max-w-md text-base text-muted-foreground leading-relaxed">
                    Open AI Coach, generate a workout plan, then save it — it will show up in this list.
                  </p>
                  <Button asChild className="mt-6 rounded-2xl">
                    <Link href="/ai-coach">Open AI Coach</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {aiWorkoutRecommendations.map((rec: any) => {
                    const exercises = rec.payload?.exercises ?? [];
                    const when = rec.createdAt
                      ? new Date(rec.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "";
                    return (
                      <Card
                        key={rec.id}
                        className="rounded-2xl border-border/60 transition-colors hover:bg-muted/25"
                      >
                        <CardContent className="flex flex-col gap-3 p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                              <Dumbbell className="h-5 w-5" />
                            </div>
                            {when ? (
                              <span className="text-xs font-medium text-muted-foreground">{when}</span>
                            ) : null}
                          </div>
                          <h3 className="font-semibold leading-snug text-foreground">{rec.title}</h3>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{rec.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
                          </p>
                          <Button
                            variant="outline"
                            className="mt-auto w-full rounded-xl"
                            onClick={() => setAiWorkoutDetail(rec)}
                          >
                            View plan
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={aiWorkoutDetail !== null} onOpenChange={(open) => !open && setAiWorkoutDetail(null)}>
            <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{aiWorkoutDetail?.title}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {aiWorkoutDetail?.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pr-1">
                {(aiWorkoutDetail?.payload?.exercises ?? []).map((exercise: any, index: number) => (
                  <div key={index} className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 dark:bg-muted/10">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground">{exercise.name}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{exercise.description}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Sets:</span> {exercise.sets} ·{" "}
                        <span className="font-medium text-foreground">Reps:</span> {exercise.reps} ·{" "}
                        <span className="font-medium text-foreground">Rest:</span> {exercise.restTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
      </div>
    </MainLayout>
  );
}