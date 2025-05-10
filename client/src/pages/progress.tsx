import { MainLayout } from "@/components/layout/main-layout";
import { ProgressSection } from "@/components/progress/progress-section";
import { LineChart } from "lucide-react";

export default function ProgressPage() {
  return (
    <MainLayout 
      title="Progress" 
      subtitle="Track your body measurements and visual progress over time."
    >
      <div className="max-w-6xl mx-auto min-h-screen w-full px-4 py-4">
        <ProgressSection />
      </div>
    </MainLayout>
  );
} 