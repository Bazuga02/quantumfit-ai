import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Utensils, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FoodDetail } from "./food-detail";
import { MainLayout } from "@/components/layout/main-layout";

export function FoodLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<any>(null);

  const { data: foods, isLoading } = useQuery({
    queryKey: ['/api/foods'],
  });

  // Filtered foods based on search term and category
  const filteredFoods = foods
    ? foods.filter((food: any) => {
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? food.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
      })
    : [];

  const categories = foods 
    ? [...new Set(foods.map((food: any) => food.category))]
    : [];

  const handleFoodClick = (food: any) => {
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
      <MainLayout
        title={selectedFood.name}
        subtitle="Nutritional information and details"
      >
        <FoodDetail
          food={selectedFood}
          onBack={handleBackToList}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Food Library"
      subtitle="Browse and learn about nutritional content of different foods"
    >
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search foods..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
    </MainLayout>
  );
}