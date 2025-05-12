import { useState, useEffect } from "react";
import { Droplets, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const WATER_GOAL = 3000; // 3L in ml

interface WaterIntakeEntry {
  amount: number;
  date: string;
}

export function WaterIntake() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalIntake, setTotalIntake] = useState(0);
  const [intakes, setIntakes] = useState<WaterIntakeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const percentage = Math.round((totalIntake / WATER_GOAL) * 100);

  useEffect(() => {
    if (user) {
      fetchWaterIntakes();
    }
  }, [user]);

  const fetchWaterIntakes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/water-intake");
      if (!response.ok) {
        throw new Error('Failed to fetch water intake data');
      }
      const data = await response.json();
      setIntakes(data.intakes || []);
      setTotalIntake(data.total || 0);
    } catch (error) {
      console.error("Error fetching water intake:", error);
      toast({
        title: "Error",
        description: "Failed to fetch water intake data. Please try again.",
        variant: "destructive",
      });
      setIntakes([]);
      setTotalIntake(0);
    } finally {
      setIsLoading(false);
    }
  };

  const addWaterIntake = async (amount: number) => {
    try {
      setIsAdding(true);
      const response = await fetch("/api/water-intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to add water intake');
      }
      await fetchWaterIntakes();
      toast({
        title: "Success",
        description: `Added ${amount}ml of water`,
      });
    } catch (error) {
      console.error("Error adding water intake:", error);
      toast({
        title: "Error",
        description: "Failed to add water intake. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="max-w-md w-full overflow-hidden border-0 shadow-xl rounded-3xl">
      <div className="p-6 bg-gradient-to-br from-[#ff3a54] to-[#ff5b71]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Droplets className="h-5 w-5 mr-2" />
            Water Intake
          </h2>
          <div className="bg-white/20 rounded-full px-3 py-1 text-white text-sm">{percentage}%</div>
        </div>
        <div className="relative h-[180px] bg-white/10 dark:bg-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          {/* Liquid container */}
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
            <div
              className="w-full bg-gradient-to-t from-[#0099ff] to-[#42a5f5] dark:from-blue-900 dark:to-blue-600 transition-all duration-1000 ease-out"
              style={{ height: `${percentage}%` }}
            >
              {/* Bubbles animation */}
              <div className="bubble-animation">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="bubble"
                    style={{
                      left: `${Math.random() * 100}%`,
                      width: `${Math.random() * 20 + 10}px`,
                      height: `${Math.random() * 20 + 10}px`,
                      animationDuration: `${Math.random() * 3 + 2}s`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Content overlay */}
            <div className="text-center">
            <h3 className="text-5xl font-bold text-white dark:text-blue-200">{totalIntake}</h3>
            <p className="text-sm opacity-80 text-white dark:text-blue-100">of {WATER_GOAL}ml</p>
            <div className="mt-2 text-xs font-medium text-white dark:text-blue-100">
                {percentage}% of daily goal
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white dark:bg-black">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            className="rounded-full bg-white dark:bg-gray-900 border-2 border-[#ff3a54] text-[#ff3a54] hover:bg-[#ff3a54]/10 dark:hover:bg-[#ff3a54]/20"
            onClick={() => addWaterIntake(100)}
            disabled={isAdding}
          >
            +100ml
          </Button>
          <Button
            className="rounded-full bg-white dark:bg-gray-900 border-2 border-[#ff3a54] text-[#ff3a54] hover:bg-[#ff3a54]/10 dark:hover:bg-[#ff3a54]/20"
            onClick={() => addWaterIntake(250)}
            disabled={isAdding}
          >
            +250ml
          </Button>
          <Button
            className="rounded-full bg-white dark:bg-gray-900 border-2 border-[#ff3a54] text-[#ff3a54] hover:bg-[#ff3a54]/10 dark:hover:bg-[#ff3a54]/20"
            onClick={() => addWaterIntake(500)}
            disabled={isAdding}
          >
            +500ml
          </Button>
        </div>
        <h3 className="font-medium flex items-center gap-1 mb-3 text-gray-700 dark:text-gray-200">
            <Clock className="h-4 w-4" /> Recent Activity
          </h3>
          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
            {isLoading ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-4">Loading...</div>
            ) : intakes.length > 0 ? (
              [...intakes].reverse().map((entry, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
                  <div className="h-8 w-8 rounded-full bg-[#0099ff]/20 flex items-center justify-center mr-3">
                    <Droplets className="h-4 w-4 text-[#0099ff]" />
                  </div>
                  <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">+{entry.amount}ml</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(entry.date), "HH:mm")}</p>
                  </div>
                </div>
              ))
            ) : (
            <div className="text-center text-gray-400 dark:text-gray-500 py-4">No water intake recorded today</div>
            )}
        </div>
      </div>
      <style>{`
        .bubble-animation {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100%;
        }
        .bubble {
          position: absolute;
          bottom: -20px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: rise linear infinite;
        }
        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </Card>
  );
} 