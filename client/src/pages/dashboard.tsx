import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout";
import { GreetingCard } from "@/components/dashboard/greeting-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { WorkoutPlan } from "@/components/dashboard/workout-plan";
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { Flame, Timer, Dumbbell } from "lucide-react";
import { FoodLibrary } from "@/components/nutrition/food-library";
import { WaterIntake } from "@/components/water-intake";
import { ProgressGraph } from "@/components/progress/progress-graph";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  
  // Demo stats data
  const statsCards = [
    {
      title: "Daily Calories",
      value: "1,842",
      icon: <Flame className="h-6 w-6 text-primary" />,
      iconBgClass: "bg-primary-50 dark:bg-primary-900/30",
      trend: {
        value: "68% of goal",
        isPositive: true
      }
    },
    {
      title: "Active Time",
      value: "48 min",
      icon: <Timer className="h-6 w-6 text-green-500" />,
      iconBgClass: "bg-green-50 dark:bg-green-900/30",
      trend: {
        value: "+12% from last week",
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
