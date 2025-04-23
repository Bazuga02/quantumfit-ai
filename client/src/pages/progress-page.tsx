import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  AreaChart, 
  LineChart, 
  Ruler, 
  Scale, 
  Camera,
  Plus, 
  Calendar
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  Area,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/lib/theme-provider";

export default function ProgressPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const { data: measurements, isLoading } = useQuery({
    queryKey: ['/api/measurements'],
    enabled: !!user,
  });

  // Generate sample data for charts
  const generateWeightData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate a realistic weight progression (starting at 185, trending down to 180)
      const weight = 185 - (i / 30) * 5 + (Math.random() * 1.5 - 0.75);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: parseFloat(weight.toFixed(1))
      });
    }
    
    return data;
  };
  
  const generateMeasurementsData = () => {
    const data = [];
    
    // Generate 5 measurement points, once per week
    for (let i = 4; i >= 0; i--) {
      const weekNum = 5 - i;
      
      // Realistic measurements with small improvements
      data.push({
        week: `Week ${weekNum}`,
        chest: 108 - (i * 0.5),
        waist: 92 - (i * 0.8),
        hips: 103 - (i * 0.3),
        arms: 38 - (i * 0.2)
      });
    }
    
    return data;
  };
  
  const weightData = generateWeightData();
  const measurementsData = generateMeasurementsData();
  
  // Format data for display
  const formattedWeight = weightData[weightData.length - 1]?.weight || "N/A";
  const previousWeight = weightData[weightData.length - 8]?.weight || "N/A";
  const weightChange = formattedWeight !== "N/A" && previousWeight !== "N/A"
    ? (formattedWeight - previousWeight).toFixed(1)
    : "N/A";
  const weightTrend = weightChange !== "N/A" ? parseFloat(weightChange) < 0 : false;
  
  // Theme for charts
  const isDark = theme === "dark";
  const textColor = isDark ? "hsl(var(--foreground))" : "hsl(var(--foreground))";
  const gridColor = isDark ? "hsl(var(--border))" : "hsl(var(--border))";

  return (
    <MainLayout
      title="Progress Tracking"
      subtitle="Monitor your fitness journey with detailed measurements and trends."
    >
      <Tabs defaultValue="weight" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="photos">Progress Photos</TabsTrigger>
          </TabsList>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Log Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log New Progress Data</DialogTitle>
                <DialogDescription>
                  Record your latest measurements to track your progress over time.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Progress logging form goes here. This feature is coming soon!
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="weight" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Weight Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Weight</p>
                    <h3 className="mt-1 text-3xl font-semibold">{formattedWeight} kg</h3>
                    <p className={`text-sm mt-1 flex items-center ${weightTrend ? "text-success-600" : "text-destructive"}`}>
                      {weightChange !== "N/A" && (
                        <>
                          {weightTrend ? "↓" : "↑"} {Math.abs(parseFloat(weightChange))} kg
                        </>
                      )}
                      <span className="text-muted-foreground ml-1">in last 7 days</span>
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Scale className="h-7 w-7 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Weight Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Goal Weight</p>
                    <h3 className="mt-1 text-3xl font-semibold">175 kg</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      5 kg to go
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Scale className="h-7 w-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Entry Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Latest Entry</p>
                    <h3 className="mt-1 text-xl font-semibold">Today</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Calendar className="h-7 w-7 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weight Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Trend</CardTitle>
              <CardDescription>
                Your weight changes over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" stroke={textColor} />
                    <YAxis 
                      stroke={textColor}
                      domain={[
                        Math.floor(Math.min(...weightData.map(d => d.weight)) - 1),
                        Math.ceil(Math.max(...weightData.map(d => d.weight)) + 1)
                      ]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
                        borderColor: "hsl(var(--border))"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)"
                      activeDot={{ r: 8 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Latest Measurements Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>
                  Track changes in your body composition over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={measurementsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="week" stroke={textColor} />
                      <YAxis stroke={textColor} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
                          borderColor: "hsl(var(--border))"
                        }}
                      />
                      <Legend />
                      <Bar dataKey="chest" name="Chest (cm)" fill="hsl(var(--primary))" />
                      <Bar dataKey="waist" name="Waist (cm)" fill="hsl(var(--chart-2, 217, 91%, 60%))" />
                      <Bar dataKey="hips" name="Hips (cm)" fill="hsl(var(--chart-3, 142, 71%, 45%))" />
                      <Bar dataKey="arms" name="Arms (cm)" fill="hsl(var(--chart-4, 335, 78%, 60%))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Measurement Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chest</p>
                    <h3 className="mt-1 text-2xl font-semibold">106 cm</h3>
                    <p className="text-sm text-success-600 mt-1">↓ 2 cm</p>
                  </div>
                  <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <Ruler className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Waist</p>
                    <h3 className="mt-1 text-2xl font-semibold">88.4 cm</h3>
                    <p className="text-sm text-success-600 mt-1">↓ 3.6 cm</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Ruler className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Arms</p>
                    <h3 className="mt-1 text-2xl font-semibold">37.2 cm</h3>
                    <p className="text-sm text-success-600 mt-1">↓ 0.8 cm</p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Ruler className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Progress Photos</CardTitle>
              <CardDescription>
                Visual documentation of your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Camera className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-muted-foreground">No progress photos uploaded yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload photos to visually track your progress over time
                </p>
                <Button>Upload Photos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
