import { MainLayout } from "@/components/layout/main-layout";
import { ProgressSection } from "@/components/progress/progress-section";

export default function ProgressPage() {
  return (
    <MainLayout
      title="Progress"
      subtitle="Training taps, measurement check-ins, and progress photos together — built to show trends, not single-day swings."
    >
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
        <ProgressSection />
      </div>
    </MainLayout>
  );
}
