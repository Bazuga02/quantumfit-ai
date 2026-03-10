import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
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
  Loader2
} from "lucide-react";

export default function AICoachPage() {
  const { toast } = useToast();
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
    if (!workoutGoals) {
      toast({
        title: "Goals required",
        description: "Please describe your fitness goals",
        variant: "destructive",
      });
      return;
    }
    
    workoutMutation.mutate({
      goals: workoutGoals,
      fitnessLevel,
      limitations: limitations || undefined,
    });
  };
  
  const handleNutritionSubmit = () => {
    if (!dietGoals) {
      toast({
        title: "Goals required",
        description: "Please describe your nutrition goals",
        variant: "destructive",
      });
      return;
    }
    
    nutritionMutation.mutate({
      goals: dietGoals,
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
      subtitle="Get personalized AI-powered recommendations for your fitness journey."
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
                <h2 className="text-xl font-bold mb-2">Your Personal AI Fitness Coach</h2>
                <p className="mb-4">
                  Get tailored recommendations for workouts, nutrition, and progress based on your goals and fitness data.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Personalized Plans</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Adaptive Feedback</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Real-time Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to use - clean steps */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">How to use</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Workout plan</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Enter your goals, fitness level, and any limitations. Then click Generate Workout Plan.
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Apple className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Nutrition plan</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Enter your nutrition goals and dietary restrictions. Then click Generate Nutrition Plan.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Example prompts: &ldquo;I want to build muscle&rdquo;, &ldquo;vegetarian meal plan for fat loss&rdquo;, &ldquo;safe workout with a knee injury&rdquo;.
            After you generate a plan, click <span className="font-medium text-foreground">Save</span> to store it.
            You can view saved plans later in the <span className="font-medium text-foreground">Recommended</span> tabs on the Workouts and Nutrition pages.
          </p>
        </div>

        {/* Get New Recommendations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Get New Recommendations</h2>
          
          <Tabs defaultValue="workout" className="space-y-6">
            <TabsList>
              <TabsTrigger value="workout" className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Workout Plan
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex items-center gap-2">
                <Apple className="h-4 w-4" />
                Nutrition Plan
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Progress Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="workout">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Workout Recommendation</CardTitle>
                  <CardDescription>
                    Describe your fitness goals and preferences to get a personalized workout plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goals">Your Fitness Goals</Label>
                    <Textarea
                      id="goals"
                      placeholder="Describe what you want to achieve (e.g., build muscle, lose weight, improve endurance)"
                      value={workoutGoals}
                      onChange={(e) => setWorkoutGoals(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fitnessLevel">Your Fitness Level</Label>
                    <div className="flex gap-4">
                      {["beginner", "intermediate", "advanced"].map((level) => (
                        <Button
                          key={level}
                          type="button"
                          variant={fitnessLevel === level ? "default" : "outline"}
                          onClick={() => setFitnessLevel(level)}
                          className="flex-1 capitalize"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="limitations">Limitations or Injuries (Optional)</Label>
                    <Textarea
                      id="limitations"
                      placeholder="Describe any physical limitations or injuries you have"
                      value={limitations}
                      onChange={(e) => setLimitations(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleWorkoutSubmit}
                    disabled={workoutMutation.isPending || !workoutGoals} 
                    className="w-full"
                  >
                    {workoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Workout Plan
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {workoutMutation.data && (
                <Card className="mt-6 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle>{workoutMutation.data.title}</CardTitle>
                    <CardDescription>{workoutMutation.data.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(workoutMutation.data.exercises ?? []).map((exercise: any, index: number): JSX.Element => (
                        <div key={index} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{exercise.description}</p>
                            <div className="text-xs text-muted-foreground">
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
            
            <TabsContent value="nutrition">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Nutrition Recommendation</CardTitle>
                  <CardDescription>
                    Get personalized meal suggestions based on your nutritional goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dietGoals">Your Nutrition Goals</Label>
                    <Textarea
                      id="dietGoals"
                      placeholder="Describe your nutrition goals (e.g., weight loss, muscle gain, better energy)"
                      value={dietGoals}
                      onChange={(e) => setDietGoals(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dietaryRestrictions">Dietary Restrictions (Optional)</Label>
                    <Input
                      id="dietaryRestrictions"
                      placeholder="Enter restrictions separated by commas (e.g., vegetarian, gluten-free, lactose intolerant)"
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleNutritionSubmit}
                    disabled={nutritionMutation.isPending || !dietGoals} 
                    className="w-full"
                  >
                    {nutritionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Nutrition Plan
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              {nutritionMutation.data && (
                <Card className="mt-6 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle>{nutritionMutation.data.title}</CardTitle>
                    <CardDescription>{nutritionMutation.data.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(nutritionMutation.data.meals ?? []).map((meal: any, index: number): JSX.Element => (
                        <div key={index} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Apple className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{meal.name}</h4>
                              <span className="text-sm">{meal.protein}g protein</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{meal.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
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
            
            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Analysis</CardTitle>
                  <CardDescription>
                    Get insights on your progress and recommendations for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <LineChart className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-muted-foreground">
                      Add more progress data to get AI analysis
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Log your measurements regularly for personalized insights
                    </p>
                    <Button>Log New Progress Data</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
