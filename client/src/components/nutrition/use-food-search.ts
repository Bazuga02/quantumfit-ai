import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Food } from "../../../../shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useFoodSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: foods = [], isLoading, error } = useQuery({
    queryKey: ["/api/foods"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/foods");
      if (!res.ok) throw new Error("Failed to fetch foods");
      return res.json() as Promise<Food[]>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredFoods = foods.filter((food: Food) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? food.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = foods
    ? Array.from(new Set(foods.map((food: Food) => food.category)))
    : [];

  return {
    foods: filteredFoods,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
  };
}
