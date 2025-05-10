import { ProgressPhotoUpload } from './progress-photo-upload';
import { ProgressPhotoGallery } from './progress-photo-gallery';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const bodyParts = [
  "All", "Full Body", "Chest", "Back", "Arms", "Waist", "Hips", "Thighs", "Other"
];

export function ProgressPhotosTab({
  refreshPhotos,
  setRefreshPhotos
}: {
  refreshPhotos: number;
  setRefreshPhotos: (fn: (r: number) => number) => void;
}) {
  const [selectedPart, setSelectedPart] = useState<string>('All');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Upload Card */}
      <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 rounded-2xl animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Upload Progress Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressPhotoUpload onUpload={() => setRefreshPhotos(r => r + 1)} />
        </CardContent>
      </Card>

      {/* Gallery Card */}
      <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 rounded-2xl animate-fade-in">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-primary">View Progress Photos</CardTitle>
          <select
            className="border border-primary/40 rounded-full px-4 py-1.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition-all"
            value={selectedPart}
            onChange={e => setSelectedPart(e.target.value)}
          >
            {bodyParts.map(bp => (
              <option key={bp} value={bp}>{bp}</option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          <div className="transition-all duration-500">
            <ProgressPhotoGallery key={refreshPhotos} filterBodyPart={selectedPart === 'All' ? undefined : selectedPart} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 