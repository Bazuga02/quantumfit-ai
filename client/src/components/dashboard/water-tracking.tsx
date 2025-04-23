import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function WaterTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState<number | null>(null);

  const { data: waterLogs, isLoading } = useQuery({
    queryKey: ["/api/water-intake", new Date().toISOString().split('T')[0]],
    enabled: !!user,
  });

  const addWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest("POST", "/api/water-intake", { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake"] });
      toast({
        title: "Water intake logged",
        description: "Your water intake has been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to log water intake",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddWater = (amount: number) => {
    addWaterMutation.mutate(amount);
  };

  // Calculate total water intake for today
  const totalWaterIntake = waterLogs 
    ? waterLogs.reduce((sum, log) => sum + log.amount, 0) 
    : 0;
  
  // Calculate percentage of goal
  const goal = user?.waterIntakeGoal || 3; // Default to 3L if not set
  const percentage = Math.min(Math.round((totalWaterIntake / goal) * 100), 100);
  
  const formattedTotal = totalWaterIntake.toFixed(1);

  // Calculate stroke-dashoffset for the progress circle
  const circleRadius = 45;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Water Intake</CardTitle>
          <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Water progress visual */}
          <div className="relative h-48 w-48 mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              {/* Progress circle with animation */}
              <circle 
                cx="50" 
                cy="50" 
                r={circleRadius} 
                fill="none" 
                stroke="hsl(var(--primary))" 
                strokeWidth="10" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">{percentage}%</p>
                <p className="text-sm text-muted-foreground">{formattedTotal}L / {goal}L</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 w-full">
            {/* Quick add buttons */}
            <Button
              variant="outline"
              className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              onClick={() => handleAddWater(0.1)}
              disabled={addWaterMutation.isPending}
            >
              + 100ml
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              onClick={() => handleAddWater(0.25)}
              disabled={addWaterMutation.isPending}
            >
              + 250ml
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              onClick={() => handleAddWater(0.5)}
              disabled={addWaterMutation.isPending}
            >
              + 500ml
            </Button>
          </div>
          
          <Button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white w-full"
            onClick={() => handleAddWater(customAmount || 0.33)}
            disabled={addWaterMutation.isPending}
          >
            {addWaterMutation.isPending ? "Adding..." : "Add Custom Amount"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
