import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "@/lib/theme-provider";

// Sample data
const generateData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Skip future dates
    if (date > today) continue;
    
    // Generate some realistic values
    const calories = i < 2 ? 0 : Math.floor(Math.random() * 600) + 1500;
    const water = i < 2 ? 0 : (Math.random() * 2 + 1).toFixed(1);
    const duration = i < 2 ? 0 : Math.floor(Math.random() * 60) + 15;
    
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calories,
      water,
      duration
    });
  }
  
  return data;
};

export function ProgressChart() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<string>("7");
  const [data, setData] = useState(generateData(7));
  
  // Update data when timeframe changes
  useEffect(() => {
    setData(generateData(parseInt(timeframe)));
  }, [timeframe]);
  
  const isDark = theme === "dark";
  const textColor = isDark ? "hsl(var(--foreground))" : "hsl(var(--foreground))";
  const gridColor = isDark ? "hsl(var(--border))" : "hsl(var(--border))";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
          <Select
            defaultValue={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={textColor} />
              <YAxis yAxisId="calories" stroke={textColor} />
              <YAxis yAxisId="water" orientation="right" stroke={textColor} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
                  borderColor: "hsl(var(--border))"
                }}
              />
              <Legend />
              <Line
                yAxisId="calories"
                type="monotone"
                dataKey="calories"
                name="Calories"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="water"
                type="monotone"
                dataKey="water"
                name="Water (L)"
                stroke="hsl(217, 91%, 60%)"
              />
              <Line
                yAxisId="calories"
                type="monotone"
                dataKey="duration"
                name="Workout (min)"
                stroke="hsl(var(--chart-3, 142, 71%, 45%))"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
