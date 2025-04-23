import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Dumbbell, Apple } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export function AIRecommendations() {
  const { user } = useAuth();

  // Demo data
  const recommendations = {
    workout: {
      title: "Workout Recommendation",
      description: "Based on your recent shoulder discomfort, consider trying these modified exercises for upper body day:",
      items: [
        "Incline bench press instead of flat bench",
        "Cable lateral raises with lighter weight",
        "Add extra shoulder mobility work"
      ],
      icon: <Dumbbell className="h-5 w-5" />,
      bgColor: "bg-primary-100 dark:bg-primary-900/50",
      textColor: "text-primary-600 dark:text-primary-400",
      buttonText: "Apply to Workout"
    },
    nutrition: {
      title: "Nutrition Optimization",
      description: "Your protein intake has been below target for 3 days. Consider adding these high-protein options:",
      items: [
        "Greek yogurt with berries (25g protein)",
        "Tuna wrap with whole grain bread (30g protein)",
        "Protein smoothie with almond milk (24g protein)"
      ],
      icon: <Apple className="h-5 w-5" />,
      bgColor: "bg-green-100 dark:bg-green-900/50",
      textColor: "text-green-600 dark:text-green-400",
      buttonText: "Add to Meal Plan"
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
            AI Coach Recommendations
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(recommendations).map((recommendation, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
              <div className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full ${recommendation.bgColor} flex items-center justify-center ${recommendation.textColor}`}>
                  {recommendation.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{recommendation.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {recommendation.description}
                  </p>
                  <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1">
                    {recommendation.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                  <Button 
                    variant="link" 
                    className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 dark:hover:text-primary-300 p-0 h-auto"
                  >
                    {recommendation.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
