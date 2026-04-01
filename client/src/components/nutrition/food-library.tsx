import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Utensils, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoodDetail } from "./food-detail";
import type { Food } from "../../../../shared/schema";

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
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
        <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
          <CardTitle className="text-xl font-bold">Food library</CardTitle>
          <CardDescription className="text-base leading-relaxed text-primary-foreground/90">
            Browse macros and calories to plan meals or compare options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-2xl pl-9"
          />
        </div>
        <Button variant="outline" className="rounded-2xl sm:shrink-0" onClick={() => setSearchTerm("")}>
          Clear
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="cursor-pointer rounded-full px-3 py-1"
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
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
          Could not load foods: {error.message}
        </div>
      ) : filteredFoods.length > 0 ? (
        <div className="space-y-2">
          {filteredFoods.map((food) => (
            <Card
              key={food.id}
              className="cursor-pointer rounded-2xl border-border/60 transition-colors hover:bg-accent/40"
              onClick={() => handleFoodClick(food)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
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
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-1">No foods found</p>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search term or filter
          </p>
          {selectedCategory && (
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setSelectedCategory(null)}
            >
              Clear filter
            </Button>
          )}
        </div>
      )}
        </CardContent>
      </Card>
    </div>
  );
}