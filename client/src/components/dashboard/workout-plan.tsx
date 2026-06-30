import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function WorkoutPlan() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Start Your Today's Workout</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex min-h-[10.5rem] flex-1 flex-col justify-between rounded-lg bg-muted/50 p-5 dark:bg-muted/30">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every workout brings you one step closer to a stronger, healthier you.
            Stay consistent and see the transformation!
          </p>
          <div className="pt-4">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white">
              <Link href="/workouts">Start Your Day</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
