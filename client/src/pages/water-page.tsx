import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterTracking } from "@/components/dashboard/water-tracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Droplets, Info } from "lucide-react";
import { format } from "date-fns";

export default function WaterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedDate] = useState(new Date());

  const { data: waterLogs, isLoading } = useQuery({
    queryKey: ["/api/water-intake", format(selectedDate, "yyyy-MM-dd")],
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
      setCustomAmount("");
    },
    onError: (error) => {
      toast({
        title: "Failed to log water intake",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCustomWater = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    addWaterMutation.mutate(amount);
  };

  // Calculate total water intake for today
  const totalWaterIntake = waterLogs
    ? waterLogs.reduce((sum, log) => sum + log.amount, 0)
    : 0;

  // Format waterLogs for history display
  const formattedLogs = waterLogs
    ? [...waterLogs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((log) => ({
          ...log,
          formattedTime: format(new Date(log.date), "hh:mm a"),
          formattedAmount: `${log.amount.toFixed(2)}L`,
        }))
    : [];

  return (
    <MainLayout title="Water Tracking" subtitle="Track your daily water intake and stay hydrated.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water intake tracker */}
        <div className="lg:col-span-1">
          <WaterTracking />
        </div>

        {/* Custom water intake form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Add Custom Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Enter amount in liters"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    step="0.1"
                    min="0"
                  />
                  <span className="text-sm font-medium">L</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddCustomWater}
                  disabled={addWaterMutation.isPending}
                >
                  {addWaterMutation.isPending ? "Adding..." : "Add Water"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hydration tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-500" />
                Hydration Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Drink 8-10 glasses (2-3 liters) of water daily
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Start your day with a glass of water
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Carry a water bottle with time markers
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Increase intake during workouts
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Eat water-rich foods like cucumber and watermelon
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Water intake history */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Today's Water Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">Loading...</div>
              ) : formattedLogs.length > 0 ? (
                <div className="space-y-3">
                  {formattedLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Droplets className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{log.formattedTime}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{log.formattedAmount}</p>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>{totalWaterIntake.toFixed(2)}L</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Droplets className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-muted-foreground">No water intake recorded today</p>
                  <p className="text-sm text-muted-foreground">
                    Start tracking your water intake to stay hydrated
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
