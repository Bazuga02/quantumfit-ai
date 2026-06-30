import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MeasurementForm } from "@/components/measurement-form";

interface MeasurementsCardProps {
  measurementCount?: number;
}

export function MeasurementsCard({ measurementCount = 0 }: MeasurementsCardProps) {
  const [open, setOpen] = useState(false);

  const bodyText =
    measurementCount > 0
      ? `You have ${measurementCount} ${measurementCount === 1 ? "entry" : "entries"} logged. Add another check-in to keep your trend lines up to date.`
      : "Log weight, body fat, and circumferences to track how you're changing over time.";

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Body measurements</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0">
          <div className="flex min-h-[10.5rem] flex-1 flex-col justify-between rounded-lg bg-muted/50 p-5 dark:bg-muted/30">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {bodyText}
              {measurementCount > 0 ? (
                <>
                  {" "}
                  <Link href="/progress" className="font-medium text-primary hover:underline">
                    View charts
                  </Link>
                </>
              ) : null}
            </p>
            <div className="pt-4">
              <Button
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => setOpen(true)}
              >
                Add measurement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Log measurement</DialogTitle>
            <DialogDescription>
              Weight and body fat are required; add any circumferences you track.
            </DialogDescription>
          </DialogHeader>
          <MeasurementForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
