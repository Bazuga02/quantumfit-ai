import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout";
import { GreetingCard } from "@/components/dashboard/greeting-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { WorkoutPlan } from "@/components/dashboard/workout-plan";
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { Flame, Dumbbell, Droplets } from "lucide-react";
import { WaterIntake } from "@/components/water-intake";
import { ProgressGraph } from "@/components/progress/progress-graph";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  
  // Fetch nutrition summary
  const { data: nutritionData } = useQuery({
    queryKey: ["/api/nutrition-summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/nutrition-summary");
      return res.json();
    },
    refetchOnWindowFocus: true,
  });

  // Fetch water intake
  const [waterIntake, setWaterIntake] = useState(0);
  const WATER_GOAL = 3000;
  useEffect(() => {
    async function fetchWater() {
      try {
        const res = await apiRequest("GET", "/api/water-intake");
        const data = await res.json();
        setWaterIntake(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch water intake:", error);
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
  useEffect(() => {
    async function fetchMeasurements() {
      try {
        const res = await apiRequest("GET", "/api/measurements");
        setMeasurements(await res.json());
      } catch (error) {
        console.error("Failed to fetch measurements:", error);
        setMeasurements([]);
      }
    }
    fetchMeasurements();
  }, []);

  const greeting =
    firstName.length > 0
      ? `Good to see you, ${firstName}. Here's a snapshot of training, nutrition, and habits — dive into anything below.`
      : "Here's a snapshot of training, nutrition, and habits — dive into anything below.";

  return (
    <MainLayout title="Dashboard" subtitle={greeting}>
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
