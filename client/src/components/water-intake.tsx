import { useState, useEffect, useMemo } from "react";
import { Droplets, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

/** Default goal if profile has no water target (settings use liters elsewhere). */
const DEFAULT_GOAL_ML = 3000;

interface WaterIntakeEntry {
  amount: number;
  date: string;
}

const QUICK_AMOUNTS = [100, 250, 500] as const;

export function WaterIntake() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalIntake, setTotalIntake] = useState(0);
  const [intakes, setIntakes] = useState<WaterIntakeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const goalMl = useMemo(() => {
    const u = user as { waterIntakeGoal?: number } | null | undefined;
    if (u?.waterIntakeGoal != null && typeof u.waterIntakeGoal === "number" && u.waterIntakeGoal > 0) {
      return Math.round(u.waterIntakeGoal * 1000);
    }
    return DEFAULT_GOAL_ML;
  }, [user]);

  const displayPercent = Math.min(100, Math.round((totalIntake / goalMl) * 100));
  const fillPercent = Math.min(100, (totalIntake / goalMl) * 100);

  useEffect(() => {
    if (user) {
      void fetchWaterIntakes();
    }
  }, [user]);

  const fetchWaterIntakes = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/water-intake");
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
      await apiRequest("POST", "/api/water-intake", { amount });
      await fetchWaterIntakes();
      toast({
        title: "Logged",
        description: `Added ${amount} ml`,
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
    <Card className="max-w-lg w-full overflow-hidden border-border/60 shadow-xl rounded-3xl ring-1 ring-primary/10">
      <CardHeader className="space-y-0 border-b border-border/40 bg-gradient-to-br from-primary via-primary to-primary/85 text-primary-foreground pb-6 pt-6">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
              <Droplets className="h-5 w-5" aria-hidden />
            </span>
            Today’s hydration
          </CardTitle>
          <span className="shrink-0 rounded-full bg-white/25 px-3 py-1.5 text-sm font-semibold tabular-nums">
            {displayPercent}%
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
          Tap an amount to log. Progress fills toward your daily goal ({goalMl / 1000} L).
        </p>

        {/* Tank */}
        <div className="relative mt-5 h-52 w-full overflow-hidden rounded-2xl border border-white/25 bg-black/15 shadow-inner">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex h-full items-end justify-stretch">
            <div
              className="w-full bg-gradient-to-t from-sky-700 via-sky-500 to-sky-300 transition-[height] duration-700 ease-out dark:from-sky-900 dark:via-sky-700 dark:to-sky-500"
              style={{ height: `${fillPercent}%` }}
              aria-hidden
            />
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center text-white">
            <span className="text-xs font-medium uppercase tracking-wider text-white/85">Total so far</span>
            <span className="mt-1 text-5xl font-bold tabular-nums tracking-tight drop-shadow-md sm:text-6xl">
              {totalIntake}
            </span>
            <span className="mt-1 text-sm font-medium text-white/90">
              ml · goal <span className="tabular-nums">{goalMl}</span> ml
            </span>
            {totalIntake > goalMl && (
              <span className="mt-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                Goal crushed — nice work
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 bg-card p-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Quick add</p>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_AMOUNTS.map((ml) => (
              <Button
                key={ml}
                type="button"
                variant="outline"
                disabled={isAdding || !user}
                onClick={() => addWaterIntake(ml)}
                className={cn(
                  "h-14 flex-col gap-0.5 rounded-2xl border-2 border-primary/40 bg-background font-semibold text-primary shadow-sm",
                  "hover:bg-primary/10 hover:border-primary dark:hover:bg-primary/15"
                )}
              >
                <span className="text-lg leading-none">+{ml}</span>
                <span className="text-sm font-normal opacity-80">ml</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" aria-hidden />
            Logged today
          </h3>
          <div
            className="max-h-[200px] space-y-2 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-2 pr-1 dark:bg-muted/15"
            role="list"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span className="text-sm">Loading…</span>
              </div>
            ) : intakes.length > 0 ? (
              [...intakes].reverse().map((entry, index) => (
                <div
                  key={`${entry.date}-${index}`}
                  role="listitem"
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-background px-3 py-3 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Droplets className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-semibold tabular-nums text-foreground">+{entry.amount} ml</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(entry.date), "h:mm a")}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm leading-relaxed text-muted-foreground">
                No glasses logged yet today. Start with a quick-add above.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
