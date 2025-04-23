import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout";
import { GreetingCard } from "@/components/dashboard/greeting-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { WaterTracking } from "@/components/dashboard/water-tracking";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { WorkoutPlan } from "@/components/dashboard/workout-plan";
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { Flame, Droplets, Timer, Dumbbell } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] || "";
  
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
      title: "Water Intake",
      value: "1.2L",
      icon: <Droplets className="h-6 w-6 text-blue-500" />,
      iconBgClass: "bg-blue-50 dark:bg-blue-900/30",
      trend: {
        value: "40% of goal",
        isPositive: false
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

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle={`Welcome back, ${firstName}! Here's your fitness overview.`}
    >
      {/* Greeting card */}
      <GreetingCard />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water tracking widget */}
        <div className="lg:col-span-1">
          <WaterTracking />
        </div>
        
        {/* Weekly progress chart */}
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        
        {/* Workout plan */}
        <div className="lg:col-span-2">
          <WorkoutPlan />
        </div>
        
        {/* Nutrition summary */}
        <div className="lg:col-span-1">
          <NutritionSummary />
        </div>
        
        {/* AI Coach recommendations */}
        <div className="lg:col-span-3">
          <AIRecommendations />
        </div>
      </div>
    </MainLayout>
  );
}
