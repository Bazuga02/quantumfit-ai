import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Apple, Calendar, ChevronRight, GanttChart, PieChart, Plus, Search, Utensils } from "lucide-react";
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
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { FoodDetail } from "@/components/nutrition/food-detail";

export default function NutritionPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<any>(null);

  const { data: foods, isLoading: isLoadingFoods } = useQuery({
    queryKey: ['/api/foods'],
    enabled: !!user,
  });

  // Filtered foods based on search term and category
  const filteredFoods = foods
    ? foods.filter((food: any) => {
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? food.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
      })
    : [];

  // Mocked nutritional data
  const nutritionData = {
    calories: {
      consumed: 1842,
      goal: user?.calorieGoal || 2700,
      remaining: (user?.calorieGoal || 2700) - 1842
    },
    macros: {
      protein: { consumed: 98, goal: user?.macros?.protein || 150 },
      carbs: { consumed: 210, goal: user?.macros?.carbs || 270 },
      fats: { consumed: 45, goal: user?.macros?.fats || 60 }
    },
    pieChart: [
      { name: "Protein", value: 98 * 4, color: "#3b82f6" },  // 4 calories per gram
      { name: "Carbs", value: 210 * 4, color: "#22c55e" },   // 4 calories per gram
      { name: "Fats", value: 45 * 9, color: "#eab308" }      // 9 calories per gram
    ],
    meals: [
      {
        name: "Breakfast",
        time: "7:30 AM",
        foods: [
          { name: "Oatmeal", quantity: 1, unit: "cup", calories: 300 },
          { name: "Protein Shake", quantity: 1, unit: "serving", calories: 220 }
        ]
      },
      {
        name: "Lunch",
        time: "12:30 PM",
        foods: [
          { name: "Grilled Chicken Salad", quantity: 1, unit: "bowl", calories: 650 }
        ]
      }
    ]
  };

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

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Log Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Your Meal</DialogTitle>
                <DialogDescription>
                  Record what you've eaten to track your nutrition.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Meal logging form goes here. This feature is coming soon!
                </p>
              </div>
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
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Protein slice - about 27% */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="10" 
                        strokeDasharray={`${0.27 * 283} ${283 - 0.27 * 283}`} 
                        strokeDashoffset="0" 
                        transform="rotate(-90 50 50)" />
                      
                      {/* Carbs slice - about 48% */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="10" 
                        strokeDasharray={`${0.48 * 283} ${283 - 0.48 * 283}`} 
                        strokeDashoffset={`${-0.27 * 283}`} 
                        transform="rotate(-90 50 50)" />
                      
                      {/* Fat slice - about 25% */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#eab308" strokeWidth="10" 
                        strokeDasharray={`${0.25 * 283} ${283 - 0.25 * 283}`} 
                        strokeDashoffset={`${-(0.27 + 0.48) * 283}`} 
                        transform="rotate(-90 50 50)" />
                    </svg>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm">Protein</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(nutritionData.pieChart[0].value / nutritionData.calories.consumed * 100)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm">Carbs</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(nutritionData.pieChart[1].value / nutritionData.calories.consumed * 100)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm">Fats</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(nutritionData.pieChart[2].value / nutritionData.calories.consumed * 100)}%</span>
                    </div>
                  </div>
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
                  {nutritionData.meals.map((meal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Utensils className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium">{meal.name}</p>
                            <p className="text-xs text-muted-foreground">{meal.time}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                      
                      <div className="ml-11 space-y-1">
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="flex justify-between text-sm">
                            <span>{food.name}</span>
                            <span className="text-muted-foreground">{food.calories} cal</span>
                          </div>
                        ))}
                      </div>
                      
                      {index < nutritionData.meals.length - 1 && (
                        <div className="border-b border-gray-200 dark:border-gray-700 py-1"></div>
                      )}
                    </div>
                  ))}
                  
                  <Button className="w-full" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Meal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="food-library">
          <div className="space-y-6">
            {/* Show selected food details or food library */}
            {selectedFood ? (
              <FoodDetail 
                food={selectedFood}
                onBack={() => setSelectedFood(null)}
              />
            ) : (
              <>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search foods..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Category filters */}
                {foods && foods.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(foods.map(food => food.category))].map((category) => (
                      <Badge 
                        key={category} 
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {isLoadingFoods ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4 h-14"></CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredFoods.length > 0 ? (
                  <div className="space-y-2">
                    {filteredFoods.map((food) => (
                      <Card 
                        key={food.id} 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedFood(food)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary">
                              <Utensils className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{food.name}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  {food.calories} kcal
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {food.category}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-1">No foods found</p>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search term or filter
                    </p>
                    {selectedCategory && (
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedCategory(null)}
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
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
                {(mealPlans && mealPlans.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mealPlans.map((plan: any) => (
                      <Card key={plan.id} className="overflow-hidden hover:border-primary transition-colors cursor-pointer" onClick={() => setSelectedMealPlan(plan)}>
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
                    ))}
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
