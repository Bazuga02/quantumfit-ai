import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type NutritionSummaryProps = {
  /** Hide the recent-meals list (e.g. on /nutrition where meals are shown separately). */
  showRecentMeals?: boolean;
  /** Hide the header log-meal action (e.g. when the page already has a log-meal dialog). */
  showLogMealAction?: boolean;
};

function MacroBar({
  label,
  consumed,
  goal,
  pct,
  barClassName,
}: {
  label: string;
  consumed: number;
  goal: number;
  pct: number;
  barClassName: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm font-medium tabular-nums text-foreground">
          {consumed}g / {goal}g
        </p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300 ease-out", barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function NutritionSummary({
  showRecentMeals = true,
  showLogMealAction = true,
}: NutritionSummaryProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/nutrition-summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/nutrition-summary");
      return res.json();
    },
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
        <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Utensils className="h-5 w-5" aria-hidden />
            </span>
            Today
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
        <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
          <CardTitle className="text-lg font-bold">Today</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-destructive">
          Failed to load nutrition summary
        </CardContent>
      </Card>
    );
  }

  const { calories, macros, meals } = data;
  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  const caloriePercentage = calculatePercentage(calories.consumed, calories.goal);
  const proteinPercentage = calculatePercentage(macros.protein.consumed, macros.protein.goal);
  const carbsPercentage = calculatePercentage(macros.carbs.consumed, macros.carbs.goal);
  const fatsPercentage = calculatePercentage(macros.fats.consumed, macros.fats.goal);

  return (
    <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Utensils className="h-5 w-5" aria-hidden />
            </span>
            Today
          </CardTitle>
          {showLogMealAction ? (
            <Link href="/nutrition">
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 rounded-xl border-0 bg-white/20 text-primary-foreground hover:bg-white/30"
              >
                Log meal
              </Button>
            </Link>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
          Calories and macros vs your goals for this day.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 bg-card p-6">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Calories</p>
            <p className="text-sm font-medium tabular-nums text-foreground">
              {calories.consumed} / {calories.goal}
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${caloriePercentage}%` }}
            />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {calories.remaining} calories remaining
          </p>
        </div>

        <div className="space-y-4">
          <MacroBar
            label="Protein"
            consumed={macros.protein.consumed}
            goal={macros.protein.goal}
            pct={proteinPercentage}
            barClassName="bg-primary"
          />
          <MacroBar
            label="Carbs"
            consumed={macros.carbs.consumed}
            goal={macros.carbs.goal}
            pct={carbsPercentage}
            barClassName="bg-emerald-500 dark:bg-emerald-400"
          />
          <MacroBar
            label="Fat"
            consumed={macros.fats.consumed}
            goal={macros.fats.goal}
            pct={fatsPercentage}
            barClassName="bg-amber-500 dark:bg-amber-400"
          />
        </div>

        {showRecentMeals ? (
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-muted/15">
            <h3 className="mb-3 text-base font-semibold text-foreground">Recent meals</h3>
            <div className="space-y-3">
              {meals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No meals logged today.</p>
              ) : (
                meals.map((meal: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{meal.type}</p>
                        <p className="truncate text-xs text-muted-foreground">{meal.name}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                      {meal.calories} cal
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
