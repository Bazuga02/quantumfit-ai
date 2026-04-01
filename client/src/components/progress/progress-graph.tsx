import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart as LineChartIcon } from "lucide-react";

const bodyParts = ["All", "Chest", "Back", "Arms", "Waist", "Hips", "Thighs", "Full Body", "Other"];

const PRIMARY = "hsl(var(--primary))";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
        <div className="mb-1 font-semibold text-foreground">{label}</div>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="mb-1 flex items-center gap-2 text-sm">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
            <span className="font-medium text-foreground">{entry.name}:</span>
            <span className="font-mono tabular-nums text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function ProgressGraph({ measurements }: { measurements: any[] }) {
  const [selectedPart, setSelectedPart] = useState("All");

  if (!measurements || measurements.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center dark:bg-muted/10">
        <LineChartIcon className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden />
        <p className="mt-4 text-base font-medium text-foreground">No measurements yet</p>
        <p className="mt-2 max-w-sm mx-auto text-sm leading-relaxed text-muted-foreground">
          After you log your first entry, weight and body-fat lines (or single-area circumferences) will appear here.
        </p>
      </div>
    );
  }

  const data = measurements.map((m: any) => ({
    date: m.date ? new Date(m.date).toLocaleDateString() : "",
    weight: m.weight,
    bodyFat: m.body_fat || m.bodyFat,
    chest: m.chest,
    back: m.back,
    arms: m.arms,
    waist: m.waist,
    hips: m.hips,
    thighs: m.thighs,
    fullBody: m["full_body"] || m["Full Body"],
    other: m.other,
  }));

  let lines = [
    <Line
      key="weight"
      type="monotone"
      dataKey="weight"
      stroke="url(#weightGradient)"
      strokeWidth={3}
      dot={{ r: 5, fill: PRIMARY, stroke: "#fff", strokeWidth: 2 }}
      activeDot={{ r: 7, fill: PRIMARY, stroke: "#fff", strokeWidth: 2 }}
      name="Weight (kg)"
      isAnimationActive={true}
      animationDuration={900}
    />,
    <Line
      key="bodyFat"
      type="monotone"
      dataKey="bodyFat"
      stroke="rgb(245 158 11)"
      strokeWidth={3}
      dot={{
        r: 5,
        fill: "rgb(245 158 11)",
        stroke: "#fff",
        strokeWidth: 2,
      }}
      activeDot={{ r: 7, fill: "rgb(245 158 11)", stroke: "#fff", strokeWidth: 2 }}
      name="Body Fat (%)"
      isAnimationActive={true}
      animationDuration={900}
    />,
  ];
  if (selectedPart !== "All") {
    const partKey = selectedPart.toLowerCase().replace(/ /g, "");
    lines = [
      <Line
        key={partKey}
        type="monotone"
        dataKey={partKey}
        stroke={PRIMARY}
        strokeWidth={3}
        dot={{ r: 5, fill: PRIMARY, stroke: "#fff", strokeWidth: 2 }}
        activeDot={{ r: 7, fill: PRIMARY, stroke: "#fff", strokeWidth: 2 }}
        name={`${selectedPart} (cm)`}
        isAnimationActive={true}
        animationDuration={900}
      />,
    ];
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/15 p-5 dark:bg-muted/10 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-foreground">Trends</h3>
        <Select value={selectedPart} onValueChange={setSelectedPart}>
          <SelectTrigger className="w-full rounded-xl sm:w-[220px]">
            <SelectValue placeholder="Body area" />
          </SelectTrigger>
          <SelectContent>
            {bodyParts.map((bp) => (
              <SelectItem key={bp} value={bp}>
                {bp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.85} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} width={40} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
