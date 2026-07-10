import { useState } from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Plus,
  Utensils,
  Loader2,
  PieChart,
  Leaf,
  Sparkles,
  Apple,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { LogMealForm } from "@/components/nutrition/log-meal-form";
import { FoodLibrary } from "@/components/nutrition/food-library";
import { cn } from "@/lib/utils";

function formatMacroGramsDisplay(raw: unknown): string {
  const original = String(raw ?? "").trim();
  if (!original) return "—";
  let s = original.replace(/\s*grams?\s*$/i, "").trim();
  s = s.replace(/(\s*[gG]+)+$/g, "").trim();
  if (s) return `${s}g`;
  return original;
}

const DONUT_R = 45;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;

type MacroSlice = { frac: number; stroke: string };

function MacrosDonut({
  proteinCals,
  carbsCals,
  fatsCals,
  isLoading,
}: {
  proteinCals: number;
  carbsCals: number;
  fatsCals: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-48 w-48 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading chart" />
      </div>
    );
  }

  const totalCals = proteinCals + carbsCals + fatsCals;
  if (totalCals <= 0) {
    return (
      <div className="flex h-48 w-48 flex-col items-center justify-center text-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-muted bg-muted/20">
          <PieChart className="h-10 w-10 text-muted-foreground/60" aria-hidden />
        </div>
        <span className="mt-3 text-sm text-muted-foreground">Log a meal to see macro split</span>
      </div>
    );
  }

  const slices: MacroSlice[] = [
    { frac: proteinCals / totalCals, stroke: "hsl(var(--primary))" },
    { frac: carbsCals / totalCals, stroke: "rgb(16 185 129)" },
    { frac: fatsCals / totalCals, stroke: "rgb(245 158 11)" },
  ];

  let offset = 0;
  return (
    <svg className="h-48 w-48" viewBox="0 0 100 100" aria-hidden>
      {slices.map(({ frac, stroke }, i) => {
        const dash = frac * DONUT_CIRC;
        const dashOffset = -offset;
        offset += dash;
        return (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={DONUT_R}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeDasharray={`${dash} ${DONUT_CIRC - dash}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            className="transition-[stroke-dasharray] duration-300"
          />
        );
      })}
    </svg>
  );
}

export default function NutritionPage() {
  const { user } = useAuth();
  const [isLogMealDialogOpen, setIsLogMealDialogOpen] = useState(false);
  const [aiNutritionDetail, setAiNutritionDetail] = useState<any | null>(null);

  const { data: aiNutritionRecommendationsRaw, isLoading: isLoadingAiNutrition } = useQuery({
    queryKey: ["/api/ai/nutrition-recommendations"],
    queryFn: () => apiRequest("GET", "/api/ai/nutrition-recommendations").then((res: Response) => res.json()),
    enabled: !!user,
  });
  const aiNutritionRecommendations = (Array.isArray(aiNutritionRecommendationsRaw)
    ? aiNutritionRecommendationsRaw
    : []) as any[];

  const { data: nutritionSummary, isLoading: isLoadingSummary, error: errorSummary } = useQuery({
    queryKey: ["/api/nutrition-summary"],
    queryFn: () => apiRequest("GET", "/api/nutrition-summary").then((res: Response) => res.json()),
    enabled: !!user,
  });

  const proteinCals = nutritionSummary
    ? nutritionSummary.macros.protein.consumed * 4
    : 0;
  const carbsCals = nutritionSummary ? nutritionSummary.macros.carbs.consumed * 4 : 0;
  const fatsCals = nutritionSummary ? nutritionSummary.macros.fats.consumed * 9 : 0;

  const totalMacroCals = proteinCals + carbsCals + fatsCals;

  return (
    <MainLayout
      title="Nutrition"
      subtitle="Log meals, scan macros, and browse foods in one flow — your daily totals stay honest when you capture things as you eat."
    >
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
        <Tabs defaultValue="summary" className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-muted/60 p-1 sm:w-auto sm:min-w-[400px]">
              <TabsTrigger
                value="summary"
                className="rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Daily summary
              </TabsTrigger>
              <TabsTrigger
                value="food-library"
                className="rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Food library
              </TabsTrigger>
              <TabsTrigger
                value="recommended"
                className="rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Recommended
              </TabsTrigger>
            </TabsList>

            <Dialog open={isLogMealDialogOpen} onOpenChange={setIsLogMealDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 rounded-2xl shadow-md sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Log meal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Log your meal</DialogTitle>
                  <DialogDescription>
                    Record what you ate so calories and macros stay up to date.
                  </DialogDescription>
                </DialogHeader>
                <LogMealForm onSuccess={() => setIsLogMealDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="summary" className="mt-0 space-y-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <NutritionSummary showRecentMeals={false} showLogMealAction={false} />
              </div>

              <div className="space-y-8 lg:col-span-7">
                <div className="grid gap-8 md:grid-cols-2">
                  <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
                    <CardHeader className="border-b border-border/50 bg-muted/30 py-4 dark:bg-muted/15">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <PieChart className="h-4 w-4" aria-hidden />
                        </span>
                        Macros breakdown
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Share of calories from protein, carbs, and fat today.
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center bg-card px-4 pb-6 pt-6">
                      <MacrosDonut
                        proteinCals={proteinCals}
                        carbsCals={carbsCals}
                        fatsCals={fatsCals}
                        isLoading={isLoadingSummary}
                      />
                      {!isLoadingSummary && nutritionSummary && totalMacroCals > 0 ? (
                        <div className="mt-2 flex w-full max-w-[220px] flex-col gap-2.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ background: "hsl(var(--primary))" }}
                              />
                              <span>Protein</span>
                            </div>
                            <span className="tabular-nums font-medium">
                              {Math.round((proteinCals / totalMacroCals) * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                              <span>Carbs</span>
                            </div>
                            <span className="tabular-nums font-medium">
                              {Math.round((carbsCals / totalMacroCals) * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                              <span>Fats</span>
                            </div>
                            <span className="tabular-nums font-medium">
                              {Math.round((fatsCals / totalMacroCals) * 100)}%
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
                    <CardHeader className="border-b border-border/50 bg-muted/30 py-4 dark:bg-muted/15">
                      <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <Calendar className="h-4 w-4" aria-hidden />
                        </span>
                        Today&apos;s meals
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Everything you logged for this day.</p>
                    </CardHeader>
                    <CardContent className="space-y-4 bg-card p-5">
                      {isLoadingSummary ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading meals" />
                        </div>
                      ) : errorSummary || !nutritionSummary ? (
                        <div className="py-8 text-center text-sm text-destructive">Could not load meals.</div>
                      ) : nutritionSummary.meals.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-10 text-center">
                          <Utensils className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">No meals yet</p>
                          <p className="mt-1 text-sm text-muted-foreground">Tap Log meal to add your first entry.</p>
                        </div>
                      ) : (
                        <ul className="max-h-[min(360px,50vh)] space-y-3 overflow-y-auto pr-1">
                          {nutritionSummary.meals.map((meal: any, index: number) => (
                            <li
                              key={index}
                              className={cn(
                                "rounded-2xl border border-border/60 bg-muted/20 p-4 dark:bg-muted/10",
                                "transition-colors hover:bg-muted/35"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                    <Utensils className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-foreground">{meal.type}</p>
                                    {meal.time ? (
                                      <p className="text-xs text-muted-foreground">{meal.time}</p>
                                    ) : null}
                                    <p className="mt-1 truncate text-sm text-muted-foreground">{meal.name}</p>
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="tabular-nums text-sm font-semibold text-foreground">
                                    {meal.calories} cal
                                  </p>
                                  <Button variant="ghost" size="sm" className="mt-1 h-8 text-xs" type="button">
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Button
                        type="button"
                        className="w-full rounded-2xl"
                        variant="outline"
                        onClick={() => setIsLogMealDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add meal
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
                  <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                        <Leaf className="h-5 w-5" aria-hidden />
                      </span>
                      Simple habits
                    </CardTitle>
                    <p className="text-sm leading-relaxed text-primary-foreground/90">
                      Small tweaks make daily tracking easier to stick with.
                    </p>
                  </CardHeader>
                  <CardContent className="grid gap-6 bg-card p-6 sm:grid-cols-3">
                    <section className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-muted/15">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                        <Apple className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        Balance
                      </h3>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        Aim for enough protein across meals; fill the rest with carbs and fats you tolerate well.
                      </p>
                    </section>
                    <section className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-muted/15">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                        <Utensils className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        Consistency
                      </h3>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        Log soon after eating so you don&apos;t rely on memory — rough estimates still help.
                      </p>
                    </section>
                    <section className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4 dark:bg-primary/10">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                        <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        Food library
                      </h3>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        Use the Food library tab to compare items and build intuition for portion sizes.
                      </p>
                    </section>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="food-library" className="mt-0">
            <FoodLibrary />
          </TabsContent>

          <TabsContent value="recommended" className="mt-0 space-y-6">
            <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-emerald-500/15 dark:ring-emerald-400/10">
              <CardHeader className="border-b border-border/50 bg-gradient-to-br from-emerald-600 to-emerald-700 py-5 text-white dark:from-emerald-600 dark:to-emerald-800">
                <CardTitle className="text-xl font-bold">AI meal plans</CardTitle>
                <CardDescription className="text-base leading-relaxed text-white/90">
                  Plans you saved from AI Coach with &quot;Save to My Meal Plans&quot; show up here.
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-card p-6">
                {isLoadingAiNutrition ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" aria-label="Loading" />
                  </div>
                ) : aiNutritionRecommendations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/25 bg-emerald-500/[0.06] px-6 py-14 text-center dark:bg-emerald-500/10">
                    <Sparkles className="mb-3 h-12 w-12 text-emerald-600/80 dark:text-emerald-400" />
                    <p className="text-base font-medium text-foreground">No saved meal plans yet</p>
                    <p className="mt-2 max-w-md text-base leading-relaxed text-muted-foreground">
                      Generate a nutrition plan in AI Coach and save it — your templates will list here.
                    </p>
                    <Button
                      asChild
                      className="mt-6 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      <Link href="/ai-coach">Open AI Coach</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {aiNutritionRecommendations.map((rec: any) => {
                      const meals = rec.payload?.meals ?? [];
                      const totals = rec.payload?.dailyTotals;
                      const when = rec.createdAt
                        ? new Date(rec.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "";
                      return (
                        <Card
                          key={rec.id}
                          className="rounded-2xl border-border/60 transition-colors hover:bg-muted/25"
                        >
                          <CardContent className="flex flex-col gap-3 p-5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <Apple className="h-5 w-5" />
                              </div>
                              {when ? (
                                <span className="text-xs font-medium text-muted-foreground">{when}</span>
                              ) : null}
                            </div>
                            <h3 className="font-semibold leading-snug text-foreground">{rec.title}</h3>
                            <p className="line-clamp-2 text-sm text-muted-foreground">{rec.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {meals.length} meal{meals.length === 1 ? "" : "s"}
                              {totals?.calories != null && totals.calories !== "" ? (
                                <span className="text-muted-foreground">
                                  {" "}
                                  · ~{totals.calories} kcal (plan total)
                                </span>
                              ) : null}
                            </p>
                            <Button
                              variant="outline"
                              className="mt-auto w-full rounded-xl border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                              onClick={() => setAiNutritionDetail(rec)}
                            >
                              View plan
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={aiNutritionDetail !== null} onOpenChange={(open) => !open && setAiNutritionDetail(null)}>
              <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>{aiNutritionDetail?.title}</DialogTitle>
                  <DialogDescription className="text-base leading-relaxed">
                    {aiNutritionDetail?.description}
                  </DialogDescription>
                </DialogHeader>
                {aiNutritionDetail?.payload?.dailyTotals ? (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm dark:bg-emerald-500/15">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">Daily totals (plan)</p>
                    <p className="mt-1 text-muted-foreground dark:text-emerald-100/80">
                      Cal: {aiNutritionDetail.payload.dailyTotals.calories} · P:{" "}
                      {formatMacroGramsDisplay(aiNutritionDetail.payload.dailyTotals.protein)} · C:{" "}
                      {formatMacroGramsDisplay(aiNutritionDetail.payload.dailyTotals.carbs)} · F:{" "}
                      {formatMacroGramsDisplay(aiNutritionDetail.payload.dailyTotals.fats)}
                    </p>
                  </div>
                ) : null}
                <div className="space-y-4 pr-1">
                  {(aiNutritionDetail?.payload?.meals ?? []).map((meal: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 dark:bg-muted/10"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="font-semibold text-foreground">{meal.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {formatMacroGramsDisplay(meal.protein)} protein · {formatMacroGramsDisplay(meal.carbs)}{" "}
                            carbs · {formatMacroGramsDisplay(meal.fats)} fat · {meal.calories ?? "—"} kcal
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{meal.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}