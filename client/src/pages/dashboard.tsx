import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout";
import { GreetingCard } from "@/components/dashboard/greeting-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { WorkoutPlan } from "@/components/dashboard/workout-plan";
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { Flame, Timer, Dumbbell, Droplets } from "lucide-react";
import { FoodLibrary } from "@/components/nutrition/food-library";
import { WaterIntake } from "@/components/water-intake";
import { ProgressGraph } from "@/components/progress/progress-graph";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  
  // Fetch nutrition summary
  const { data: nutritionData } = useQuery({
    queryKey: ["/api/nutrition-summary"],
    queryFn: async () => {
      const res = await fetch("/api/nutrition-summary");
      if (!res.ok) throw new Error("Failed to fetch nutrition summary");
      return res.json();
    },
    refetchOnWindowFocus: true,
  });

  // Fetch water intake
  const [waterIntake, setWaterIntake] = useState(0);
  const WATER_GOAL = 3000;
  useEffect(() => {
    async function fetchWater() {
      const res = await fetch("/api/water-intake");
      if (res.ok) {
        const data = await res.json();
        setWaterIntake(data.total || 0);
      }
    }
    fetchWater();
  }, []);

  // Stats cards with real data
  const statsCards = [
    {
      title: "Daily Calories",
      value: nutritionData ? nutritionData.calories.consumed.toLocaleString() : "-",
      icon: <Flame className="h-6 w-6 text-primary" />,
      iconBgClass: "bg-primary-50 dark:bg-primary-900/30",
      trend: {
        value: nutritionData ? `${Math.round((nutritionData.calories.consumed / nutritionData.calories.goal) * 100)}% of goal` : "-",
        isPositive: true
      }
    },
    {
      title: "Water Intake",
      value: `${waterIntake} ml`,
      icon: <Droplets className="h-6 w-6 text-blue-500" />,
      iconBgClass: "bg-blue-50 dark:bg-blue-900/30",
      trend: {
        value: `${Math.round((waterIntake / WATER_GOAL) * 100)}% of goal`,
        isPositive: true
      }
    },
    {
      title: "Workouts",
      value: "3 / 5",
      icon: <Dumbbell className="h-6 w-6 text-purple-500" />,
      iconBgClass: "bg-purple-50 dark:bg-purple-900/30",
      trend: {
        value: "60% completed",
        isPositive: true
      }
    }
  ];

  // Progress measurements state
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchMeasurements() {
      setLoading(true);
      const res = await fetch("/api/measurements");
      if (res.ok) {
        setMeasurements(await res.json());
      } else {
        setMeasurements([]);
      }
      setLoading(false);
    }
    fetchMeasurements();
  }, []);

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle={`Welcome back, ${firstName}! Here's your fitness overview.`}
    >
      {/* Greeting card */}
      <GreetingCard />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {statsCards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconBgClass={card.iconBgClass}
            trend={card.trend}
          />
        ))}
      </div>

      {/* Progress Graph */}
      <div className="mb-4">
        <ProgressGraph measurements={measurements} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout plan */}
        <div className="lg:col-span-2">
          <WorkoutPlan />
        </div>
        
        {/* AI Coach recommendations */}
        <div className="lg:col-span-3">
          <AIRecommendations />
        </div>
      </div>

      {/* Water Intake and Nutrition side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <WaterIntake />
        <NutritionSummary />
      </div>

    </MainLayout>
  );
}
