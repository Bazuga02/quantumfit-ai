import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  BrainCircuit,
  Dumbbell,
  Apple,
  LineChart,
  CheckCircle,
  Clock,
  Sparkles,
  Loader2,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

const FITNESS_LEVEL_OPTIONS = [
  {
    value: "beginner",
    label: "Beginner",
    hint: "New to the gym or getting back after a break.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    hint: "You train regularly and know most movements.",
  },
  {
    value: "advanced",
    label: "Advanced",
    hint: "Heavy loads, technical lifts, or high volume.",
  },
] as const;

/** Groq may return "25", "25g", "25gg", or "25 grams" — we show a single "Ng" before labels like "protein". */
function formatMacroGramsDisplay(raw: unknown): string {
  const original = String(raw ?? "").trim();
  if (!original) return "—";
  let s = original.replace(/\s*grams?\s*$/i, "").trim();
  s = s.replace(/(\s*[gG]+)+$/g, "").trim();
  if (s) return `${s}g`;
  return original;
}

export default function AICoachPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const workoutAiResultRef = useRef<HTMLDivElement>(null);
  const nutritionAiResultRef = useRef<HTMLDivElement>(null);

  const [workoutGoals, setWorkoutGoals] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState("intermediate");
  const [limitations, setLimitations] = useState("");
  const [dietGoals, setDietGoals] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  
  // Workout recommendation mutation
  const workoutMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/ai/workout-recommendation", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendation Generated",
        description: "Your personalized workout plan is ready!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate recommendation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Nutrition recommendation mutation
  const nutritionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/ai/nutrition-recommendation", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendation Generated",
        description: "Your personalized nutrition plan is ready!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate recommendation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save AI workout recommendation (only when user clicks "Save to My Workouts")
  const saveWorkoutMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; exercises: any[] }) => {
      const res = await apiRequest("POST", "/api/ai/workout-recommendation/save", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Workout recommendation saved to your list." });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/workout-recommendations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "Could not save workout recommendation",
        variant: "destructive",
      });
    },
  });

  // Save AI nutrition recommendation (only when user clicks "Save to My Meal Plans")
  const saveNutritionMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; meals: any[]; dailyTotals: any }) => {
      const res = await apiRequest("POST", "/api/ai/nutrition-recommendation/save", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Nutrition recommendation saved to your list." });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/nutrition-recommendations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "Could not save nutrition recommendation",
        variant: "destructive",
      });
    },
  });
  
  const handleWorkoutSubmit = () => {
    const goals = workoutGoals.trim();
    if (!goals) {
      toast({
        title: "Goals required",
        description: "Please describe your fitness goals",
        variant: "destructive",
      });
      return;
    }

    workoutMutation.mutate({
      goals,
      fitnessLevel,
      limitations: limitations.trim() || undefined,
    });
  };

  useEffect(() => {
    if (!workoutMutation.data) return;
    const t = window.setTimeout(() => {
      workoutAiResultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    return () => clearTimeout(t);
  }, [workoutMutation.data]);

  useEffect(() => {
    if (!nutritionMutation.data) return;
    const t = window.setTimeout(() => {
      nutritionAiResultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    return () => clearTimeout(t);
  }, [nutritionMutation.data]);

  const handleNutritionSubmit = () => {
    const goals = dietGoals.trim();
    if (!goals) {
      toast({
        title: "Goals required",
        description: "Please describe your nutrition goals",
        variant: "destructive",
      });
      return;
    }

    nutritionMutation.mutate({
      goals,
      dietaryRestrictions: dietaryRestrictions ? dietaryRestrictions.split(",").map(item => item.trim()) : undefined,
      currentIntake: {
        calories: 2000,
        protein: 100,
        carbs: 200,
        fats: 50
      }
    });
  };

  return (
    <MainLayout
      title="AI Coach"
      subtitle="Generate workout blocks, nutrition templates, and progress notes tuned to what you tell it — save anything you want to reuse."
    >
      <div className="grid grid-cols-1 gap-6">
        {/* AI Coach Banner */}
        <Card className="bg-gradient-to-r from-primary/80 to-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Your Personal AI Fitness Coach</h2>
                <p className="mb-4 text-base sm:text-lg leading-relaxed text-white/95">
                  Get tailored recommendations for workouts, nutrition, and progress based on your goals and fitness data.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Personalized Plans</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Adaptive Feedback</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm sm:text-base">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Real-time Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to use — guided layout */}
        <section className="mb-2" aria-labelledby="ai-coach-how-to-heading">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <h2
                id="ai-coach-how-to-heading"
                className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <BrainCircuit className="h-5 w-5" aria-hidden />
                </span>
                How to use the AI Coach
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground max-w-2xl">
                Fill in your context, pick a tab, then generate. You can refine and save plans to your library.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Workout guide */}
            <Card className="overflow-hidden border border-primary/15 shadow-md bg-card dark:bg-card/80 ring-1 ring-primary/5">
              <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/80" aria-hidden />
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Dumbbell className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold leading-snug">
                      Workout recommendations
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Strength, cardio bias, injuries, and experience level all help the model.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-5 pt-0">
                <ol className="space-y-3 text-base leading-relaxed text-muted-foreground">
                  <li className="flex gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                      1
                    </span>
                    <span>
                      Describe your <strong className="text-foreground font-medium">goals</strong> in the text area
                      (e.g. build muscle, run a 5K, feel stronger).
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                      2
                    </span>
                    <span>
                      Choose <strong className="text-foreground font-medium">fitness level</strong> and add any{" "}
                      <strong className="text-foreground font-medium">limitations or injuries</strong>.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      3
                    </span>
                    <span className="flex flex-wrap items-center gap-x-1">
                      Press
                      <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Generate Workout Plan
                      </span>
                      — your plan appears below the form.
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Nutrition guide */}
            <Card className="overflow-hidden border border-emerald-500/20 shadow-md bg-card dark:bg-card/80 ring-1 ring-emerald-500/10 dark:ring-emerald-400/10">
              <div
                className="h-1 bg-gradient-to-r from-emerald-500/70 via-emerald-500 to-emerald-600/80"
                aria-hidden
              />
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm dark:bg-emerald-600">
                    <Apple className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold leading-snug">
                      Nutrition recommendations
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Goals plus restrictions (vegan, allergies, etc.) produce safer, clearer meal ideas.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-5 pt-0">
                <ol className="space-y-3 text-base leading-relaxed text-muted-foreground">
                  <li className="flex gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                      1
                    </span>
                    <span>
                      Write your <strong className="text-foreground font-medium">nutrition goals</strong> (fat loss,
                      surplus for gain, more protein, steady energy…).
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                      2
                    </span>
                    <span>
                      Optionally list <strong className="text-foreground font-medium">dietary restrictions</strong>{" "}
                      as comma-separated tags.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      3
                    </span>
                    <span className="flex flex-wrap items-center gap-x-1">
                      Press
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        <Sparkles className="h-3 w-3" aria-hidden />
                        Generate Nutrition Plan
                      </span>
                      — meals and totals show under the form.
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Example prompts */}
          <Card className="mt-4 border-dashed border-muted-foreground/25 bg-muted/30 dark:bg-muted/10">
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" aria-hidden />
                Example prompts you can paste or paraphrase
              </div>
            </CardHeader>
            <CardContent className="pb-5 pt-0">
              <ul className="grid gap-2 sm:grid-cols-1 md:grid-cols-3">
                <li className="rounded-lg border bg-background/80 px-4 py-3 text-base leading-relaxed text-muted-foreground shadow-sm dark:bg-background/40">
                  <span className="mr-1.5 text-primary font-medium">Workout ·</span>
                  “I want to build muscle and gain weight — 3–4 days in the gym, limited equipment.”
                </li>
                <li className="rounded-lg border bg-background/80 px-4 py-3 text-base leading-relaxed text-muted-foreground shadow-sm dark:bg-background/40">
                  <span className="mr-1.5 text-emerald-600 dark:text-emerald-400 font-medium">Nutrition ·</span>
                  “Vegetarian meal plan for fat loss, around 180g protein, no dairy.”
                </li>
                <li className="rounded-lg border bg-background/80 px-4 py-3 text-base leading-relaxed text-muted-foreground shadow-sm dark:bg-background/40">
                  <span className="mr-1.5 text-primary font-medium">Safety ·</span>
                  “I have a knee injury — suggest a lower-impact leg day and alternatives to squats.”
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA strip */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent px-4 py-3.5 dark:from-primary/15 dark:via-primary/10 dark:to-transparent">
            <p className="text-base leading-relaxed text-foreground font-medium flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary shrink-0" aria-hidden />
              Try the <strong className="font-semibold">Workout</strong>,{" "}
              <strong className="font-semibold">Nutrition</strong>, and{" "}
              <strong className="font-semibold">Progress</strong> tabs below — each uses your inputs differently.
            </p>
            <span className="hidden sm:inline-flex items-center text-sm font-medium text-muted-foreground">
              <ArrowRight className="h-4 w-4 mr-1" aria-hidden />
              Scroll to Get New Recommendations
            </span>
          </div>
        </section>

        {/* Get New Recommendations */}
        <section className="scroll-mt-4" aria-labelledby="get-recommendations-heading">
          <div className="mb-5">
            <h2
              id="get-recommendations-heading"
              className="text-2xl font-bold tracking-tight flex items-center gap-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              Get new recommendations
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground max-w-2xl">
              Pick a tab, tell the coach what you need, then generate. Plans appear below each form so you can save them.
            </p>
          </div>

          <Tabs defaultValue="workout" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-xl bg-muted/70 p-2 text-muted-foreground sm:grid-cols-3 dark:bg-muted/40">
              <TabsTrigger
                value="workout"
                className="gap-2 rounded-lg py-3 data-[state=active]:shadow-md sm:flex-col sm:items-center sm:justify-center sm:gap-1 sm:px-2"
              >
                <Dumbbell className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-base font-semibold">Workout plan</span>
                <span className="hidden text-sm font-normal opacity-90 sm:inline">Sessions & exercises</span>
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                className="gap-2 rounded-lg py-3 data-[state=active]:shadow-md sm:flex-col sm:items-center sm:justify-center sm:gap-1 sm:px-2"
              >
                <Apple className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-base font-semibold">Nutrition plan</span>
                <span className="hidden text-sm font-normal opacity-90 sm:inline">Meals & macros</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="gap-2 rounded-lg py-3 data-[state=active]:shadow-md sm:flex-col sm:items-center sm:justify-center sm:gap-1 sm:px-2"
              >
                <LineChart className="h-4 w-4 shrink-0" aria-hidden />
                <span className="text-base font-semibold">Progress analysis</span>
                <span className="hidden text-sm font-normal opacity-90 sm:inline">Trends & next steps</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workout" className="mt-6 space-y-6">
              <Card className="overflow-hidden border-primary/15 shadow-lg ring-1 ring-primary/10">
                <div className="h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/70" aria-hidden />
                <CardHeader className="space-y-1 pb-2 pt-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Build a workout plan</CardTitle>
                  <CardDescription className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    The more specific you are about goals, schedule, and equipment, the better the plan. Mention injuries so the coach can avoid risky patterns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-2">
                  <div className="space-y-3 rounded-xl border border-border/80 bg-muted/25 p-4 dark:bg-muted/15">
                    <div>
                      <Label htmlFor="goals" className="text-base font-semibold text-foreground">
                        Your fitness goals
                      </Label>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-1 mb-2">
                        Aim for 2–4 sentences: outcome, days per week, home vs gym, gear you have.
                      </p>
                      <Textarea
                        id="goals"
                        placeholder='Example: "I want stronger legs and better posture. I can train 4 days, have dumbbells and a bench, and prefer sessions under 60 minutes."'
                        value={workoutGoals}
                        onChange={(e) => setWorkoutGoals(e.target.value)}
                        className="min-h-[128px] resize-y text-base leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-base font-semibold text-foreground">Your fitness level</span>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-1">
                        This calibrates intensity and complexity — pick what best matches you today.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {FITNESS_LEVEL_OPTIONS.map((opt) => {
                        const selected = fitnessLevel === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFitnessLevel(opt.value)}
                            className={cn(
                              "rounded-xl border-2 p-3.5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              selected
                                ? "border-primary bg-primary/10 shadow-sm dark:bg-primary/15"
                                : "border-border/60 bg-card hover:border-primary/35 hover:bg-muted/30"
                            )}
                          >
                            <span className="block text-base font-semibold text-foreground">{opt.label}</span>
                            <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                              {opt.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-4 dark:bg-muted/10">
                    <div>
                      <Label htmlFor="limitations" className="text-base font-semibold text-foreground">
                        Limitations or injuries{" "}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-1 mb-2">
                        Joints, pain, doctor restrictions, or exercises to avoid — leave blank if none.
                      </p>
                      <Textarea
                        id="limitations"
                        placeholder='Example: "Mild knee pain — no deep lunges; OK with bike and upper body."'
                        value={limitations}
                        onChange={(e) => setLimitations(e.target.value)}
                        className="min-h-[88px] resize-y text-base leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 border-t bg-muted/20 px-4 py-4 dark:bg-muted/10 sm:px-6">
                  <Button
                    onClick={handleWorkoutSubmit}
                    disabled={workoutMutation.isPending || !workoutGoals.trim()}
                    className="w-full h-11 text-base font-semibold"
                  >
                    {workoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating plan…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate workout plan
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    Runs on AI — always verify exercises feel safe for your body.
                  </p>
                </CardFooter>
              </Card>
              
              {workoutMutation.data && (
                <Card
                  ref={workoutAiResultRef}
                  className="scroll-mt-24 border-primary/25 shadow-md ring-1 ring-primary/10 overflow-hidden rounded-xl md:scroll-mt-28"
                >
                  <div className="bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary sm:px-6">
                    Your generated plan
                  </div>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-xl">{workoutMutation.data.title}</CardTitle>
                    <CardDescription className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                      {workoutMutation.data.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(workoutMutation.data.exercises ?? []).map((exercise: any, index: number): JSX.Element => (
                        <div key={index} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-base font-semibold">{exercise.name}</h4>
                            <p className="text-base text-muted-foreground mb-1 leading-relaxed">{exercise.description}</p>
                            <div className="text-sm text-muted-foreground">
                              <span><b>Sets:</b> {exercise.sets} </span> |{" "}
                              <span><b>Reps:</b> {exercise.reps} </span> |{" "}
                              <span><b>Rest:</b> {exercise.restTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => saveWorkoutMutation.mutate(workoutMutation.data)}
                      disabled={saveWorkoutMutation.isPending}
                    >
                      {saveWorkoutMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save to My Workouts"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="nutrition" className="mt-6 space-y-6">
              <Card className="overflow-hidden border-emerald-500/20 shadow-lg ring-1 ring-emerald-500/15 dark:ring-emerald-400/10">
                <div
                  className="h-1.5 bg-gradient-to-r from-emerald-500/60 via-emerald-500 to-emerald-600/70"
                  aria-hidden
                />
                <CardHeader className="space-y-1 pb-2 pt-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Build a nutrition plan</CardTitle>
                  <CardDescription className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    Share your targets and any must-follow food rules. The coach will outline meals and rough macro
                    targets — adjust portions for your appetite and your clinician’s advice.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pb-2">
                  <div className="space-y-3 rounded-xl border border-border/80 bg-muted/25 p-4 dark:bg-muted/15">
                    <div>
                      <Label htmlFor="dietGoals" className="text-base font-semibold text-foreground">
                        Your nutrition goals
                      </Label>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-1 mb-2">
                        Include calorie preference if you have one, protein targets, or constraints like “busy job,
                        need simple prep.”
                      </p>
                      <Textarea
                        id="dietGoals"
                        placeholder='Example: "Slow fat loss, ~2 kg/month, hit 140g protein, 3 meals + snack, minimal dairy."'
                        value={dietGoals}
                        onChange={(e) => setDietGoals(e.target.value)}
                        className="min-h-[128px] resize-y text-base leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-dashed border-emerald-500/25 bg-emerald-500/[0.06] p-4 dark:bg-emerald-500/10">
                    <div>
                      <Label htmlFor="dietaryRestrictions" className="text-base font-semibold text-foreground">
                        Dietary restrictions{" "}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-1 mb-2">
                        Comma-separated works best — allergies, halal/kosher, vegan, gluten-free, etc.
                      </p>
                      <Input
                        id="dietaryRestrictions"
                        placeholder="vegetarian, nut allergy, no shellfish"
                        value={dietaryRestrictions}
                        onChange={(e) => setDietaryRestrictions(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 border-t bg-muted/20 px-4 py-4 dark:bg-muted/10 sm:px-6">
                  <Button
                    onClick={handleNutritionSubmit}
                    disabled={nutritionMutation.isPending || !dietGoals.trim()}
                    className="w-full h-11 text-base font-semibold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    {nutritionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating plan…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate nutrition plan
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    Not medical advice — use it as a template and adapt with a professional if needed.
                  </p>
                </CardFooter>
              </Card>

              {nutritionMutation.data && (
                <Card
                  ref={nutritionAiResultRef}
                  className="scroll-mt-24 border-emerald-500/30 shadow-md ring-1 ring-emerald-500/10 overflow-hidden rounded-xl dark:ring-emerald-400/10 md:scroll-mt-28"
                >
                  <div className="bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-300 sm:px-6">
                    Your generated plan
                  </div>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-xl">{nutritionMutation.data.title}</CardTitle>
                    <CardDescription className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                      {nutritionMutation.data.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(nutritionMutation.data.meals ?? []).map((meal: any, index: number): JSX.Element => (
                        <div key={index} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Apple className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between gap-2">
                              <h4 className="text-base font-semibold">{meal.name}</h4>
                              <span className="text-base shrink-0">
                                {formatMacroGramsDisplay(meal.protein)} protein
                              </span>
                            </div>
                            <p className="text-base text-muted-foreground leading-relaxed">{meal.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full h-11 text-base font-semibold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      onClick={() => saveNutritionMutation.mutate(nutritionMutation.data)}
                      disabled={saveNutritionMutation.isPending}
                    >
                      {saveNutritionMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save to My Meal Plans"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              <Card className="overflow-hidden border-border/80 shadow-md">
                <div className="h-1.5 bg-gradient-to-r from-muted-foreground/30 via-primary/40 to-muted-foreground/30" aria-hidden />
                <CardHeader className="space-y-1 pb-2 pt-6">
                  <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Progress analysis</CardTitle>
                  <CardDescription className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    Full AI progress insights from this screen are coming soon. For now, log measurements and photos on
                    the Progress page so your data is ready.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-8 pt-2 sm:px-6">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center dark:bg-muted/10">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <LineChart className="h-7 w-7" aria-hidden />
                    </div>
                    <p className="max-w-md text-base font-medium text-foreground">
                      Keep your measurements and photos up to date
                    </p>
                    <p className="mt-2 max-w-md text-base text-muted-foreground leading-relaxed">
                      The more history you add, the more useful automated analysis will be when we enable it here.
                    </p>
                    <Button asChild className="mt-6 h-11 px-8 font-semibold">
                      <Link href="/progress">Open Progress</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </MainLayout>
  );
}
