import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Utensils, Clock, Plus, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const logMealSchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  time: z.string().min(1, "Time is required"),
  date: z.string().optional(),
  foods: z.array(
    z.object({
      foodId: z.number(),
      servings: z.number().min(0.1, "Servings must be at least 0.1"),
    })
  ).min(1, "At least one food must be added"),
});

type LogMealFormValues = z.infer<typeof logMealSchema>;

export function LogMealForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);

  const form = useForm<LogMealFormValues>({
    resolver: zodResolver(logMealSchema),
    defaultValues: {
      name: "",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      foods: [],
    },
  });

  const { data: foods, isLoading: isLoadingFoods } = useQuery({
    queryKey: ['/api/foods'],
  });

  // Filter foods based on search
  const filteredFoods = foods
    ? foods.filter((food: any) => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const logMealMutation = useMutation({
    mutationFn: async (data: LogMealFormValues) => {
      const res = await apiRequest("POST", "/api/meals", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition-summary'] });
      toast({
        title: "Meal logged successfully",
        description: "Your meal has been added to your nutrition tracker.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addFood = (food: any) => {
    // Check if food is already added
    if (selectedFoods.some(item => item.id === food.id)) {
      toast({
        title: "Food already added",
        description: "This food is already in your meal.",
        variant: "destructive",
      });
      return;
    }

    const newFood = {
      ...food,
      servings: 1,
    };

    setSelectedFoods([...selectedFoods, newFood]);
    
    // Update the form values
    const currentFoods = form.getValues().foods || [];
    form.setValue("foods", [
      ...currentFoods,
      { foodId: food.id, servings: 1 }
    ], { shouldValidate: true });
  };

  const removeFood = (index: number) => {
    const newSelectedFoods = [...selectedFoods];
    newSelectedFoods.splice(index, 1);
    setSelectedFoods(newSelectedFoods);

    // Update the form values
    const newFoods = [...form.getValues().foods];
    newFoods.splice(index, 1);
    form.setValue("foods", newFoods, { shouldValidate: true });
  };

  const updateServings = (index: number, servings: number) => {
    const newSelectedFoods = [...selectedFoods];
    newSelectedFoods[index].servings = servings;
    setSelectedFoods(newSelectedFoods);

    // Update the form values
    const newFoods = [...form.getValues().foods];
    newFoods[index].servings = servings;
    form.setValue("foods", newFoods, { shouldValidate: true });
  };

  const calculateTotalCalories = () => {
    return selectedFoods.reduce((total, food) => 
      total + (food.calories * food.servings), 0);
  };

  const calculateTotalMacros = () => {
    return {
      protein: selectedFoods.reduce((total, food) => 
        total + (food.protein * food.servings), 0),
      carbs: selectedFoods.reduce((total, food) => 
        total + (food.carbs * food.servings), 0),
      fats: selectedFoods.reduce((total, food) => 
        total + (food.fats * food.servings), 0),
    };
  };

  const onSubmit = (data: LogMealFormValues) => {
    logMealMutation.mutate(data);
  };

  const mealTypes = [
    "Breakfast", "Morning Snack", "Lunch", 
    "Afternoon Snack", "Dinner", "Evening Snack"
  ];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Name</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mealTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Time" 
                      type="time"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Foods</h3>
              {selectedFoods.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Total: {Math.round(calculateTotalCalories())} kcal | 
                  P: {Math.round(calculateTotalMacros().protein)}g | 
                  C: {Math.round(calculateTotalMacros().carbs)}g | 
                  F: {Math.round(calculateTotalMacros().fats)}g
                </div>
              )}
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search foods..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {selectedFoods.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-muted-foreground">Selected Foods:</h4>
                {selectedFoods.map((food, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Utensils className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(food.calories * food.servings)} kcal
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            className="w-16 h-8 text-center"
                            value={food.servings}
                            onChange={(e) => updateServings(index, parseFloat(e.target.value) || 0)}
                          />
                          <span className="ml-1 text-sm text-muted-foreground">
                            {food.servingUnit}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFood(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="border rounded-md">
              <h4 className="px-3 py-2 text-sm font-medium border-b">Food Search Results</h4>
              <ScrollArea className="h-[200px]">
                {isLoadingFoods ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading foods...
                  </div>
                ) : filteredFoods.length > 0 ? (
                  <div className="divide-y">
                    {filteredFoods.map((food: any) => (
                      <div
                        key={food.id}
                        className="p-3 flex items-center justify-between hover:bg-accent cursor-pointer"
                        onClick={() => addFood(food)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Utensils className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{food.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {food.calories} kcal / {food.servingSize} {food.servingUnit}
                              </span>
                              <Badge variant="outline" className="text-xs py-0 h-5">
                                {food.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm 
                      ? "No foods found matching your search" 
                      : "Start typing to search for foods"}
                  </div>
                )}
              </ScrollArea>
            </div>

            {form.formState.errors.foods && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.foods.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onSuccess}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={selectedFoods.length === 0 || logMealMutation.isPending}
            >
              {logMealMutation.isPending ? "Saving..." : "Log Meal"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}