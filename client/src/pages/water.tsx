import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { WaterIntake } from "@/components/water-intake";
import { Droplets } from "lucide-react";

export default function WaterPage() {
  return (
    <MainLayout 
      title="Water Intake"
      subtitle="Track your daily water consumption and stay hydrated."
    >
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start w-full max-w-5xl mx-auto">
        {/* Main water intake card */}
        <div className="flex-1 flex justify-center">
          <WaterIntake />
        </div>
        {/* Hydration Tips */}
        <div className="flex-1 min-w-[320px] max-w-md">
          <Card className="max-w-md w-full overflow-hidden border-0 shadow-xl rounded-3xl">
            {/* Gradient Header */}
            <div className="p-6 bg-gradient-to-br from-[#3a8bff] to-[#5bbcff] dark:from-blue-900 dark:to-blue-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Droplets className="h-5 w-5 mr-2" />
                  Hydration Tips
                </h2>
              </div>
            </div>
            {/* White/Dark Content Area */}
            <div className="p-6 bg-white dark:bg-gray-900 rounded-b-3xl">
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Why Stay Hydrated?</h3>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200 space-y-1">
                    <li>Improves physical performance</li>
                    <li>Boosts energy levels and brain function</li>
                    <li>Helps with weight management</li>
                    <li>Promotes healthy skin</li>
                    <li>Aids in digestion and nutrient absorption</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Daily Water Intake Guidelines</h3>
                  <p className="text-gray-700 dark:text-gray-200 mb-2">The general recommendation is to drink 2-3 liters (8-12 cups) of water per day. However, your needs may vary based on:</p>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200 space-y-1">
                    <li>Your activity level</li>
                    <li>Climate and weather</li>
                    <li>Body size and composition</li>
                    <li>Overall health</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Tips for Staying Hydrated</h3>
                  <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200 space-y-1">
                    <li>Carry a water bottle with you</li>
                    <li>Set reminders to drink water</li>
                    <li>Drink water before meals</li>
                    <li>Add flavor with fruits or herbs</li>
                    <li>Monitor your urine color (aim for light yellow)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 