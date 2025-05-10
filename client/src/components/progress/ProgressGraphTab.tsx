import { MeasurementForm } from '@/components/measurement-form';
import { ProgressGraph } from './progress-graph';

export function ProgressGraphTab({
  measurements,
  showLogForm,
  setShowLogForm,
  fetchMeasurements
}: {
  measurements: any[];
  showLogForm: boolean;
  setShowLogForm: (v: boolean) => void;
  fetchMeasurements: () => void;
}) {
  return (
    <div className="rounded-2xl shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 p-0 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-2 bg-primary/90 rounded-t-2xl">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Progress Graph</h2>
        <button
          className="px-4 py-1 bg-white text-primary font-semibold  rounded-sm shadow-lg hover:scale-105 transition-all text-lg"
          onClick={() => setShowLogForm(true)}
        >
          Log Progress
        </button>
      </div>
      {/* Chart Card */}
      <div className="p-8 bg-white dark:bg-gray-900 rounded-b-2xl">
        {showLogForm && (
          <div className="mb-4">
            <MeasurementForm
              onSuccess={() => {
                setShowLogForm(false);
                fetchMeasurements();
              }}
            />
          </div>
        )}
        <ProgressGraph measurements={measurements} />
      </div>
    </div>
  );
} 