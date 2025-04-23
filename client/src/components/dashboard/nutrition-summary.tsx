import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Utensils } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function NutritionSummary() {
  const { user } = useAuth();
  
  // Demo data
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
    meals: [
      {
        type: "Breakfast",
        name: "Oatmeal & Protein Shake",
        calories: 520,
        icon: <Utensils className="h-4 w-4" />,
        bgColor: "bg-green-100 dark:bg-green-900/50",
        textColor: "text-green-600 dark:text-green-400"
      },
      {
        type: "Lunch",
        name: "Grilled Chicken Salad",
        calories: 650,
        icon: <Utensils className="h-4 w-4" />,
        bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
        textColor: "text-yellow-600 dark:text-yellow-400"
      }
    ]
  };

  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  const caloriePercentage = calculatePercentage(
    nutritionData.calories.consumed,
    nutritionData.calories.goal
  );
  
  const proteinPercentage = calculatePercentage(
    nutritionData.macros.protein.consumed,
    nutritionData.macros.protein.goal
  );
  
  const carbsPercentage = calculatePercentage(
    nutritionData.macros.carbs.consumed,
    nutritionData.macros.carbs.goal
  );
  
  const fatsPercentage = calculatePercentage(
    nutritionData.macros.fats.consumed,
    nutritionData.macros.fats.goal
  );

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
              {nutritionData.calories.consumed} / {nutritionData.calories.goal}
            </p>
          </div>
          <Progress value={caloriePercentage} className="h-2.5" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {nutritionData.calories.remaining} calories remaining
          </p>
        </div>
        
        {/* Macros */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Protein</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {nutritionData.macros.protein.consumed}g / {nutritionData.macros.protein.goal}g
              </p>
            </div>
            <Progress value={proteinPercentage} className="h-2.5 bg-gray-200 dark:bg-gray-700">
              <div className="h-full bg-blue-500 rounded-full" />
            </Progress>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Carbs</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {nutritionData.macros.carbs.consumed}g / {nutritionData.macros.carbs.goal}g
              </p>
            </div>
            <Progress value={carbsPercentage} className="h-2.5 bg-gray-200 dark:bg-gray-700">
              <div className="h-full bg-green-500 rounded-full" />
            </Progress>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Fat</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {nutritionData.macros.fats.consumed}g / {nutritionData.macros.fats.goal}g
              </p>
            </div>
            <Progress value={fatsPercentage} className="h-2.5 bg-gray-200 dark:bg-gray-700">
              <div className="h-full bg-yellow-500 rounded-full" />
            </Progress>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recent Meals</h3>
          <div className="space-y-2">
            {nutritionData.meals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-md ${meal.bgColor} flex items-center justify-center ${meal.textColor}`}>
                    {meal.icon}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{meal.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{meal.name}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{meal.calories} cal</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
