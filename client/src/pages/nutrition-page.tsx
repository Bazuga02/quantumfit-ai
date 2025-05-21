import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, GanttChart, Plus, Utensils } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { MealDetail } from "@/components/nutrition/meal-detail";
import { LogMealForm } from "@/components/nutrition/log-meal-form";
import { UtensilsCrossed } from "lucide-react";
import { FoodLibrary } from "@/components/nutrition/food-library";

export default function NutritionPage() {
  const { user } = useAuth();
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isLogMealDialogOpen, setIsLogMealDialogOpen] = useState(false);

  // Fetch meal plans
  const { data: mealPlans } = useQuery({
    queryKey: ['/api/meal-plans'],
    queryFn: () => apiRequest('GET', '/api/meal-plans').then((res: Response) => res.json()),
    enabled: !!user,
  });

  // Fetch nutrition summary
  const { data: nutritionSummary, isLoading: isLoadingSummary, error: errorSummary } = useQuery({
    queryKey: ['/api/nutrition-summary'],
    queryFn: () => apiRequest('GET', '/api/nutrition-summary').then((res: Response) => res.json()),
    enabled: !!user,
  });

  return (
    <MainLayout
      title="Nutrition"
      subtitle="Track your meals, calories, and macronutrients."
    >
      <Tabs defaultValue="summary" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="summary">Daily Summary</TabsTrigger>
            <TabsTrigger value="food-library">Food Library</TabsTrigger>
            <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
          </TabsList>

          <Dialog open={isLogMealDialogOpen} onOpenChange={setIsLogMealDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Log Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Log Your Meal</DialogTitle>
                <DialogDescription>
                  Record what you've eaten to track your nutrition.
                </DialogDescription>
              </DialogHeader>
              <LogMealForm onSuccess={() => setIsLogMealDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calories & Macros Summary */}
            <div className="lg:col-span-1">
              <NutritionSummary />
            </div>

            {/* Macros Breakdown Chart */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Macros Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative h-48 w-48 mb-4">
                    {isLoadingSummary || !nutritionSummary ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
                    ) : (() => {
                        const proteinCals = nutritionSummary.macros.protein.consumed * 4;
                        const carbsCals = nutritionSummary.macros.carbs.consumed * 4;
                        const fatsCals = nutritionSummary.macros.fats.consumed * 9;
                        const totalCals = proteinCals + carbsCals + fatsCals;
                        if (totalCals === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                              <svg width="120" height="120" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                                <text x="50" y="55" textAnchor="middle" fontSize="16" fill="#bdbdbd">Empty</text>
                              </svg>
                              <span className="mt-2 text-sm">No macro data yet</span>
                            </div>
                          );
                        }
                        // For SVG donut chart
                        const circ = 2 * Math.PI * 45; // r=45
                        const proteinFrac = proteinCals / totalCals;
                        const carbsFrac = carbsCals / totalCals;
                        const fatsFrac = fatsCals / totalCals;
                        return (
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {/* Protein slice */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="10"
                              strokeDasharray={`${proteinFrac * circ} ${circ - proteinFrac * circ}`}
                              strokeDashoffset="0"
                              transform="rotate(-90 50 50)" />
                            {/* Carbs slice */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="10"
                              strokeDasharray={`${carbsFrac * circ} ${circ - carbsFrac * circ}`}
                              strokeDashoffset={`-${proteinFrac * circ}`}
                              transform="rotate(-90 50 50)" />
                            {/* Fats slice */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#eab308" strokeWidth="10"
                              strokeDasharray={`${fatsFrac * circ} ${circ - fatsFrac * circ}`}
                              strokeDashoffset={`-${(proteinFrac + carbsFrac) * circ}`}
                              transform="rotate(-90 50 50)" />
                          </svg>
                        );
                      })()
                    }
                  </div>
                  {/* Legend and percentages */}
                  {isLoadingSummary || !nutritionSummary ? null : (() => {
                    const proteinCals = nutritionSummary.macros.protein.consumed * 4;
                    const carbsCals = nutritionSummary.macros.carbs.consumed * 4;
                    const fatsCals = nutritionSummary.macros.fats.consumed * 9;
                    const totalCals = proteinCals + carbsCals + fatsCals;
                    return (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm">Protein</span>
                          </div>
                          <span className="text-sm font-medium">{Math.round((proteinCals / totalCals) * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm">Carbs</span>
                          </div>
                          <span className="text-sm font-medium">{Math.round((carbsCals / totalCals) * 100)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm">Fats</span>
                          </div>
                          <span className="text-sm font-medium">{Math.round((fatsCals / totalCals) * 100)}%</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Today's Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingSummary ? (
                    <div className="text-center text-muted-foreground py-8">Loading meals...</div>
                  ) : errorSummary || !nutritionSummary ? (
                    <div className="text-center text-destructive py-8">Failed to load meals</div>
                  ) : nutritionSummary.meals.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No meals logged today.</div>
                  ) : (
                    nutritionSummary.meals.map((meal: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                              <Utensils className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{meal.type}</p>
                              {meal.time && <p className="text-xs text-muted-foreground">{meal.time}</p>}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                        <div className="ml-11 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{meal.name}</span>
                            <span className="text-muted-foreground">{meal.calories} cal</span>
                          </div>
                        </div>
                        {index < nutritionSummary.meals.length - 1 && (
                          <div className="border-b border-gray-200 dark:border-gray-700 py-1"></div>
                        )}
                      </div>
                    ))
                  )}
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsLogMealDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Meal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="food-library">
          <FoodLibrary />
        </TabsContent>

        <TabsContent value="meal-plans">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Meal Plans</h2>
              <Button className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Create Meal Plan
              </Button>
            </div>
            
            {selectedMeal ? (
              <MealDetail 
                meal={selectedMeal}
                onBack={() => setSelectedMeal(null)}
              />
            ) : (
              <>
                {(Array.isArray(mealPlans) && mealPlans.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(mealPlans) ? mealPlans.map((plan: any) => (
                      <Card key={plan.id} className="overflow-hidden hover:border-primary transition-colors cursor-pointer" onClick={() => setSelectedMeal(plan)}>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg font-semibold flex items-center">
                            <UtensilsCrossed className="h-5 w-5 mr-2 text-primary" />
                            {plan.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-sm text-muted-foreground mb-4">
                            {plan.description || "A custom meal plan with balanced nutrition"}
                          </div>
                          <div className="space-y-2">
                            {plan.meals && plan.meals.slice(0, 2).map((meal: any) => (
                              <div key={meal.id} className="flex justify-between items-center p-2 rounded-md bg-accent/50">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Utensils className="h-4 w-4 text-primary" />
                                  </div>
                                  <span>{meal.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{meal.time}</span>
                              </div>
                            ))}
                            {(!plan.meals || plan.meals.length === 0) && (
                              <div className="py-4 text-center text-muted-foreground text-sm">
                                No meals added yet
                              </div>
                            )}
                          </div>
                          {plan.meals && plan.meals.length > 2 && (
                            <div className="text-xs text-center text-muted-foreground mt-2">
                              + {plan.meals.length - 2} more meals
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )) : null}
                  </div>
                ) : (
                  <div className="grid grid-cols-1">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <GanttChart className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-lg font-medium mb-1">No meal plans found</p>
                          <p className="text-muted-foreground mb-4">
                            Create your first meal plan to streamline your nutrition
                          </p>
                          <Button>Create Meal Plan</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
