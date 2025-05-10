import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export function NutritionSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/nutrition-summary"],
    queryFn: async () => {
      const res = await fetch("/api/nutrition-summary");
      if (!res.ok) throw new Error("Failed to fetch nutrition summary");
      return res.json();
    },
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground">Loading nutrition summary...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-destructive">Failed to load nutrition summary</div>
        </CardContent>
      </Card>
    );
  }

  const { calories, macros, meals } = data;
  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  const caloriePercentage = calculatePercentage(calories.consumed, calories.goal);
  const proteinPercentage = calculatePercentage(macros.protein.consumed, macros.protein.goal);
  const carbsPercentage = calculatePercentage(macros.carbs.consumed, macros.carbs.goal);
  const fatsPercentage = calculatePercentage(macros.fats.consumed, macros.fats.goal);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Nutrition</CardTitle>
          <Link href="/nutrition/log">
            <Button variant="link" className="text-primary p-0 h-auto">
              Log Meal
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calories progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Calories</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {calories.consumed} / {calories.goal}
            </p>
          </div>
          <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${caloriePercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {calories.remaining} calories remaining
          </p>
        </div>
        {/* Macros */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Protein</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {macros.protein.consumed}g / {macros.protein.goal}g
              </p>
            </div>
            <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${proteinPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Carbs</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {macros.carbs.consumed}g / {macros.carbs.goal}g
              </p>
            </div>
            <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${carbsPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Fat</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {macros.fats.consumed}g / {macros.fats.goal}g
              </p>
            </div>
            <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${fatsPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recent Meals</h3>
          <div className="space-y-2">
            {meals.length === 0 ? (
              <div className="text-xs text-muted-foreground">No meals logged today.</div>
            ) : (
              meals.map((meal: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary`}>
                      <Utensils className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{meal.type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{meal.name}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{meal.calories} cal</p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
