import { useEffect, useState } from "react";
import { ProgressBodyPartsTab } from "./ProgressBodyPartsTab";
import { ProgressGraphTab } from "./ProgressGraphTab";
import { ProgressPhotosTab } from "./ProgressPhotosTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const bodyPartsList = [
  "Chest", "Back", "Arms", "Waist", "Hips", "Thighs", "Full Body", "Other"
];

export function ProgressSection() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshPhotos, setRefreshPhotos] = useState(0);
  const [showLogForm, setShowLogForm] = useState(false);
  const [trainedToday, setTrainedToday] = useState<string[]>([]);
  const [logging, setLogging] = useState(false);
  const [recentStats, setRecentStats] = useState<any[]>([]); // [{ bodyPart, count }]
  const [activeTab, setActiveTab] = useState<string>('bodyparts');
  const [calendarData, setCalendarData] = useState<{ [date: string]: number }>({});

  const fetchMeasurements = async () => {
    setLoading(true);
    const res = await fetch("/api/measurements");
    if (res.ok) {
      setMeasurements(await res.json());
    } else {
      setMeasurements([]);
    }
    setLoading(false);
  };

  const fetchTrainedToday = async () => {
    const res = await fetch("/api/trained-body-parts");
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
    const res = await fetch(`/api/trained-body-parts?from=${from.toISOString().slice(0,10)}`);
    if (res.ok) {
      const data = await res.json();
      const counts: Record<string, number> = {};
      for (const bp of bodyPartsList) counts[bp] = 0;
      for (const entry of data) {
        if (counts[entry.bodyPart] !== undefined) counts[entry.bodyPart]++;
      }
      setRecentStats(bodyPartsList.map(bp => ({ bodyPart: bp, count: counts[bp] })));
    } else {
      setRecentStats([]);
    }
  };

  // Fetch last 30 days for calendar heatmap
  const fetchCalendarData = async () => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 29);
    const res = await fetch(`/api/trained-body-parts?from=${from.toISOString().slice(0,10)}`);
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
    await fetch("/api/trained-body-parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body_part: bodyPart })
    });
    setLogging(false);
    fetchTrainedToday();
    fetchRecentStats();
  };

  if (loading) return <div>Loading progress...</div>;

  return (
    <div className=" mx-auto w-full p-0">
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'bodyparts' | 'graph' | 'photos')} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="bodyparts">Body Parts Trained</TabsTrigger>
          <TabsTrigger value="graph">Progress Graph</TabsTrigger>
          <TabsTrigger value="photos">Progress Photos</TabsTrigger>
        </TabsList>
        <TabsContent value="bodyparts">
          <ProgressBodyPartsTab
            trainedToday={trainedToday}
            logging={logging}
            logBodyPart={logBodyPart}
            recentStats={recentStats}
            calendarData={calendarData}
            bodyPartsList={bodyPartsList}
          />
        </TabsContent>
        <TabsContent value="graph">
          <ProgressGraphTab
            measurements={measurements}
            showLogForm={showLogForm}
            setShowLogForm={setShowLogForm}
            fetchMeasurements={fetchMeasurements}
          />
        </TabsContent>
        <TabsContent value="photos">
          <ProgressPhotosTab
            refreshPhotos={refreshPhotos}
            setRefreshPhotos={setRefreshPhotos}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 