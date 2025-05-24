import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function WorkoutPlan() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Start Your Today's Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-4">
          <p>
            Every workout brings you one step closer to a stronger, healthier you. 
            Stay consistent and see the transformation!
          </p>
          <Link href="/workouts">
            <Button className="mt-4 bg-primary hover:bg-primary/90 text-white w-full">
              Start Your Day
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}