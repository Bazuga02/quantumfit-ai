import { MeasurementForm } from "@/components/measurement-form";
import { ProgressGraph } from "./progress-graph";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

export function ProgressGraphTab({
  measurements,
  showLogForm,
  setShowLogForm,
  fetchMeasurements,
}: {
  measurements: any[];
  showLogForm: boolean;
  setShowLogForm: (v: boolean) => void;
  fetchMeasurements: () => void;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <LineChart className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-xl font-bold">Measurements</CardTitle>
              <CardDescription className="mt-1.5 text-base leading-relaxed !text-primary-foreground/90">
                Track weight, body fat, and circumference trends after each check-in.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {showLogForm ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-white/40 bg-transparent text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
                onClick={() => setShowLogForm(false)}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 rounded-xl border-0 bg-white/20 text-primary-foreground hover:bg-white/30"
              onClick={() => setShowLogForm(true)}
            >
              Log measurement
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 bg-card p-6">
        {showLogForm ? (
          <div className="rounded-2xl border border-border/60 bg-muted/25 p-4 dark:bg-muted/15">
            <MeasurementForm
              onSuccess={() => {
                setShowLogForm(false);
                fetchMeasurements();
              }}
            />
          </div>
        ) : null}
        <ProgressGraph measurements={measurements} />
      </CardContent>
    </Card>
  );
}
