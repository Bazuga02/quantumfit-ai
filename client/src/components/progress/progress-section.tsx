import { useEffect, useState } from "react";
import { ProgressBodyPartsTab } from "./ProgressBodyPartsTab";
import { ProgressGraphTab } from "./ProgressGraphTab";
import { ProgressPhotosTab } from "./ProgressPhotosTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Dumbbell, LineChart, Camera } from "lucide-react";

const bodyPartsList = [
  "Chest", "Back", "Arms", "Waist", "Hips", "Thighs", "Full Body", "Other",
];

export function ProgressSection() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshPhotos, setRefreshPhotos] = useState(0);
  const [showLogForm, setShowLogForm] = useState(false);
  const [trainedToday, setTrainedToday] = useState<string[]>([]);
  const [logging, setLogging] = useState(false);
  const [recentStats, setRecentStats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("bodyparts");
  const [calendarData, setCalendarData] = useState<{ [date: string]: number }>({});

  const fetchMeasurements = async () => {
    setLoading(true);
    const res = await apiRequest("GET", "/api/measurements");
    if (res.ok) {
      setMeasurements(await res.json());
    } else {
      setMeasurements([]);
    }
    setLoading(false);
  };

  const fetchTrainedToday = async () => {
    const res = await apiRequest("GET", "/api/trained-body-parts");
    if (res.ok) {
      const data = await res.json();
      setTrainedToday(data.map((d: any) => d.bodyPart));
    } else {
      setTrainedToday([]);
    }
  };

  const fetchRecentStats = async () => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    const res = await apiRequest("GET", `/api/trained-body-parts?from=${from.toISOString().slice(0, 10)}`);
    if (res.ok) {
      const data = await res.json();
      const counts: Record<string, number> = {};
      for (const bp of bodyPartsList) counts[bp] = 0;
      for (const entry of data) {
        if (counts[entry.bodyPart] !== undefined) counts[entry.bodyPart]++;
      }
      setRecentStats(bodyPartsList.map((bp) => ({ bodyPart: bp, count: counts[bp] })));
    } else {
      setRecentStats([]);
    }
  };

  const fetchCalendarData = async () => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 29);
    const res = await apiRequest("GET", `/api/trained-body-parts?from=${from.toISOString().slice(0, 10)}`);
    if (res.ok) {
      const data = await res.json();
      const map: { [date: string]: number } = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(from);
        d.setDate(from.getDate() + i);
        map[d.toISOString().slice(0, 10)] = 0;
      }
      for (const entry of data) {
        const day = entry.date.slice(0, 10);
        map[day] = (map[day] || 0) + 1;
      }
      setCalendarData(map);
    } else {
      setCalendarData({});
    }
  };

  useEffect(() => {
    fetchMeasurements();
    fetchTrainedToday();
    fetchRecentStats();
    fetchCalendarData();
  }, []);

  const logBodyPart = async (bodyPart: string) => {
    setLogging(true);
    try {
      const res = await apiRequest("POST", "/api/trained-body-parts", { body_part: bodyPart });
      if (!res.ok) return;
      await Promise.all([fetchTrainedToday(), fetchRecentStats(), fetchCalendarData()]);
    } finally {
      setLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-border/60 bg-card/50 py-16 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading progress" />
        <p className="mt-4 text-base">Loading your progress data…</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "bodyparts" | "graph" | "photos")} className="w-full">
        <TabsList className="grid h-auto w-full max-w-2xl grid-cols-3 rounded-2xl bg-muted/60 p-1 dark:bg-muted/40">
          <TabsTrigger value="bodyparts" className="gap-1.5 rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Dumbbell className="hidden h-4 w-4 sm:inline" aria-hidden />
            Training
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-1.5 rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <LineChart className="hidden h-4 w-4 sm:inline" aria-hidden />
            Measurements
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-1.5 rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Camera className="hidden h-4 w-4 sm:inline" aria-hidden />
            Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bodyparts" className="mt-8">
          <ProgressBodyPartsTab
            trainedToday={trainedToday}
            logging={logging}
            logBodyPart={logBodyPart}
            recentStats={recentStats}
            calendarData={calendarData}
            bodyPartsList={bodyPartsList}
          />
        </TabsContent>
        <TabsContent value="graph" className="mt-8">
          <ProgressGraphTab
            measurements={measurements}
            showLogForm={showLogForm}
            setShowLogForm={setShowLogForm}
            fetchMeasurements={fetchMeasurements}
          />
        </TabsContent>
        <TabsContent value="photos" className="mt-8">
          <ProgressPhotosTab refreshPhotos={refreshPhotos} setRefreshPhotos={setRefreshPhotos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
