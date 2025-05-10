import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Utensils, Info, ArrowUpRight, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FoodDetailProps {
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
    imageUrl?: string;
    description?: string;
    nutrients?: { name: string; amount: number; unit: string }[];
  };
  onBack: () => void;
}

export function FoodDetail({ food, onBack }: FoodDetailProps) {
  // Calculate macronutrient percentages
  const totalMacros = food.protein + food.carbs + food.fats;
  const proteinPercentage = Math.round((food.protein * 4 / food.calories) * 100);
  const carbsPercentage = Math.round((food.carbs * 4 / food.calories) * 100);
  const fatsPercentage = Math.round((food.fats * 9 / food.calories) * 100);

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
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowUpRight className="h-4 w-4" />
          Add to Meal
        </Button>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Utensils className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{food.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge>{food.category}</Badge>
              <Badge variant="outline">{food.calories} calories</Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calories</p>
                <p className="text-2xl font-bold">{food.calories}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serving Size</p>
                <p className="text-2xl font-bold">{food.servingSize}</p>
                <p className="text-xs text-muted-foreground">{food.servingUnit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-lg font-bold">{food.category}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Macronutrients</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Protein</span>
                    <span className="text-sm">{food.protein}g ({proteinPercentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${proteinPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Carbohydrates</span>
                    <span className="text-sm">{food.carbs}g ({carbsPercentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${carbsPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fats</span>
                    <span className="text-sm">{food.fats}g ({fatsPercentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${fatsPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>
            </div>

            {food.description && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{food.description}</p>
                </div>
              </>
            )}

            {food.nutrients && food.nutrients.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Nutritional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {food.nutrients.map((nutrient, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{nutrient.name}</span>
                        <span className="text-sm font-medium">{nutrient.amount} {nutrient.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Protein to Fat Ratio</p>
                <p className="text-2xl font-bold">{(food.protein / (food.fats || 1)).toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Calories per 100g</p>
                <p className="text-2xl font-bold">{Math.round(food.calories * (100 / food.servingSize))}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}