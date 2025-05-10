import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Utensils, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FoodDetail } from "./food-detail";
import { MainLayout } from "@/components/layout/main-layout";
import type { Food } from "@shared/schema";

async function fetchFoods(category?: string, query?: string) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (query) params.append('query', query);

  const response = await fetch(`/api/foods?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch foods: ${response.status}`);
  }
  return response.json() as Promise<Food[]>;
}

export function FoodLibrary() {
 

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const { data: foods = [], isLoading, error } = useQuery({
    queryKey: ['foods'],
    queryFn: () => fetchFoods(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Filter foods on the frontend
  const filteredFoods = foods.filter((food: Food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? food.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });



  

  const categories = foods 
    ? Array.from(new Set(foods.map((food: Food) => food.category)))
    : [];

  

  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
  };

  const handleBackToList = () => {
    setSelectedFood(null);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // If a food is selected, show its details
  if (selectedFood) {
    return (
      <FoodDetail
        food={selectedFood}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Food Library</h2>
      <p className="text-muted-foreground mb-4">Browse and learn about nutritional content of different foods</p>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => setSearchTerm('')}>
          Clear
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 h-14"></CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Error loading foods: {error.message}
        </div>
      ) : filteredFoods.length > 0 ? (
        <div className="space-y-2">
          {filteredFoods.map((food) => (
            <Card 
              key={food.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleFoodClick(food)}
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
    </div>
  );
}