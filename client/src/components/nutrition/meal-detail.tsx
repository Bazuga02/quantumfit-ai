import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, UtensilsCrossed, Calendar, Clock, PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MealFood {
  id: number;
  mealId: number;
  foodId: number;
  servings: number;
  food: {
    id: number;
    name: string;
    calories: number;
    servingSize: number;
    servingUnit: string;
    protein: number;
    carbs: number;
    fats: number;
    category: string;
  };
}

interface MealDetailProps {
  meal: {
    id: number;
    name: string;
    mealPlanId: number;
    time: string;
    foods: MealFood[];
  };
  onBack: () => void;
}

export function MealDetail({ meal, onBack }: MealDetailProps) {
  // Calculate total nutrition
  const totalCalories = meal.foods.reduce((sum, item) => 
    sum + (item.food.calories * item.servings), 0);
  const totalProtein = meal.foods.reduce((sum, item) => 
    sum + (item.food.protein * item.servings), 0);
  const totalCarbs = meal.foods.reduce((sum, item) => 
    sum + (item.food.carbs * item.servings), 0);
  const totalFats = meal.foods.reduce((sum, item) => 
    sum + (item.food.fats * item.servings), 0);

  // Calculate macronutrient percentages
  const proteinCalories = totalProtein * 4;
  const carbsCalories = totalCarbs * 4;
  const fatsCalories = totalFats * 9;
  
  const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100) || 0;
  const carbsPercentage = Math.round((carbsCalories / totalCalories) * 100) || 0;
  const fatsPercentage = Math.round((fatsCalories / totalCalories) * 100) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{meal.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{meal.time}</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nutritional Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calories</p>
                <p className="text-2xl font-bold">{Math.round(totalCalories)}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Protein</p>
                <p className="text-2xl font-bold">{Math.round(totalProtein)}</p>
                <p className="text-xs text-muted-foreground">g</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Carbs</p>
                <p className="text-2xl font-bold">{Math.round(totalCarbs)}</p>
                <p className="text-xs text-muted-foreground">g</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fats</p>
                <p className="text-2xl font-bold">{Math.round(totalFats)}</p>
                <p className="text-xs text-muted-foreground">g</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Macronutrient Breakdown</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Protein</span>
                    <span className="text-sm">{Math.round(totalProtein)}g ({proteinPercentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${proteinPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Carbohydrates</span>
                    <span className="text-sm">{Math.round(totalCarbs)}g ({carbsPercentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${carbsPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fats</span>
                    <span className="text-sm">{Math.round(totalFats)}g ({fatsPercentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${fatsPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Foods in this Meal</h3>
            <Button variant="outline" size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Food
            </Button>
          </div>

          {meal.foods.length > 0 ? (
            <div className="space-y-3">
              {meal.foods.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UtensilsCrossed className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.food.name}</p>
                          <div className="flex gap-3">
                            <Badge variant="outline">{item.food.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.servings} serving{item.servings > 1 ? 's' : ''} ({item.food.servingSize * item.servings} {item.food.servingUnit})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{Math.round(item.food.calories * item.servings)} kcal</p>
                          <p className="text-xs text-muted-foreground">
                            P: {Math.round(item.food.protein * item.servings)}g • 
                            C: {Math.round(item.food.carbs * item.servings)}g • 
                            F: {Math.round(item.food.fats * item.servings)}g
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No foods added to this meal yet</p>
                <Button variant="outline" className="mt-4 gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Food
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}