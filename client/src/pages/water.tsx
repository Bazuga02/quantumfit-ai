import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterIntake } from "@/components/water-intake";
import { Droplets, HeartPulse, Sun, Sparkles } from "lucide-react";

export default function WaterPage() {
  return (
    <MainLayout
      title="Water intake"
      subtitle="Log drinks through the day and watch your level against your personal goal — small reminders beat perfect streaks."
    >
      <div className="mx-auto w-full max-w-6xl space-y-10 px-0 pb-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="flex justify-center lg:col-span-7">
            <WaterIntake />
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
              <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <Droplets className="h-5 w-5" aria-hidden />
                  </span>
                  Hydration tips
                </CardTitle>
                <p className="text-sm leading-relaxed text-primary-foreground/90">
                  Small habits beat perfect plans — use what fits your day.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 bg-card p-6">
                <section className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-muted/15">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                    <HeartPulse className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    Why it matters
                  </h3>
                  <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-primary">
                    <li>Better focus and steadier energy through the day</li>
                    <li>Easier performance in workouts and recovery</li>
                    <li>Digestion and skin often feel better when you’re topped up</li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-muted/15">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                    <Sun className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    Rough daily target
                  </h3>
                  <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                    Many people land around <strong className="text-foreground">2–3 liters</strong> from fluids, more
                    if you train hard or it’s hot. Your app goal is a guide — adjust in Settings if needed.
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-primary">
                    <li>Activity and sweat increase needs</li>
                    <li>Larger bodies often need more volume</li>
                    <li>Illness, travel, and caffeine/alcohol shift balance</li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4 dark:bg-primary/10">
                  <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    Easy wins
                  </h3>
                  <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-primary">
                    <li>Keep a bottle visible at your desk or in your bag</li>
                    <li>Pair a glass of water with coffee or meals</li>
                    <li>Set one phone reminder mid-morning and mid-afternoon</li>
                    <li>Light yellow urine is a simple “enough fluids” cue for most people</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
