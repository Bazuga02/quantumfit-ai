import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CheckIcon, DumbbellIcon, BarChart3Icon, CalendarIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export function ProgressBodyPartsTab({
  trainedToday,
  logging,
  logBodyPart,
  recentStats,
  calendarData,
  bodyPartsList,
}: {
  trainedToday: string[];
  logging: boolean;
  logBodyPart: (bp: string) => void;
  recentStats: any[];
  calendarData: { [date: string]: number };
  bodyPartsList: string[];
}) {
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const calendarDates = Object.keys(calendarData);
  const maxDayCount = Math.max(1, ...Object.values(calendarData));

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
        <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <DumbbellIcon className="h-5 w-5" aria-hidden />
            </span>
            Today&apos;s training
          </CardTitle>
          <CardDescription className="text-base leading-relaxed !text-primary-foreground/90">
            Tap each area you trained today. Logged items lock until tomorrow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-card p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {bodyPartsList.map((bp) => {
              const done = trainedToday.includes(bp);
              return (
                <button
                  key={bp}
                  type="button"
                  className={cn(
                    "relative min-h-[44px] rounded-2xl border-2 px-2 py-2.5 text-center text-sm font-semibold transition-all",
                    done
                      ? "border-primary/40 bg-primary text-primary-foreground shadow-md"
                      : "border-border/60 bg-muted/30 text-foreground hover:border-primary/35 hover:bg-muted/50 dark:bg-muted/15"
                  )}
                  disabled={logging || done}
                  onClick={() => logBodyPart(bp)}
                >
                  {bp}
                  {done ? <CheckIcon className="absolute right-1.5 top-1.5 h-3.5 w-3.5 opacity-90" /> : null}
                </button>
              );
            })}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            One tap per body part per day keeps your calendar honest without extra forms.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
          <CardHeader className="border-b border-border/50 bg-muted/30 py-4 dark:bg-muted/15">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <BarChart3Icon className="h-4 w-4" aria-hidden />
              </span>
              Training frequency
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Count of logs per area over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-card px-4 pb-6 pt-4 sm:px-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={recentStats} margin={{ top: 10, right: 12, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="bodyPart" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
          <CardHeader className="border-b border-border/50 bg-muted/30 py-4 dark:bg-muted/15">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CalendarIcon className="h-4 w-4" aria-hidden />
              </span>
              Activity calendar
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Last 30 days — darker cells mean more body-part logs that day.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-card p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weekDays.map((day, i) => (
                <div
                  key={`weekday-${i}`}
                  className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
                >
                  {day}
                </div>
              ))}
              {calendarDates.map((date) => {
                const count = calendarData[date] ?? 0;
                const active = count > 0;
                const intensity = active ? 0.35 + (0.65 * count) / maxDayCount : 0;
                const strong = active && intensity >= 0.55;
                return (
                  <div
                    key={date}
                    title={
                      date + (count > 0 ? `: ${count} log${count === 1 ? "" : "s"}` : ": no logs")
                    }
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-xl text-xs font-medium tabular-nums sm:text-sm",
                      active
                        ? cn("shadow-sm", strong ? "text-primary-foreground" : "text-foreground")
                        : "bg-muted/40 text-muted-foreground dark:bg-muted/25"
                    )}
                    style={
                      active
                        ? {
                            background: `hsl(var(--primary) / ${intensity.toFixed(2)})`,
                          }
                        : undefined
                    }
                  >
                    {new Date(date + "T12:00:00").getDate()}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
