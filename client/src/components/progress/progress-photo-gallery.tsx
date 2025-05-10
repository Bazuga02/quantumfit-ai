import { useEffect, useState } from "react";

export function ProgressPhotoGallery({ filterBodyPart }: { filterBodyPart?: string }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      const res = await fetch("/api/progress-photos");
      const data = res.ok ? await res.json() : [];
      setPhotos(data);
      setLoading(false);
    }
    fetchPhotos();
  }, []);

  const filtered = filterBodyPart
    ? photos.filter((p) => p.bodyPart === filterBodyPart)
    : photos;

  if (loading) return <div>Loading photos...</div>;
  if (!filtered.length) return <div className="text-gray-500">No progress photos yet.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
      {filtered.map((photo, i) => (
        <div
          key={photo.id}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 flex flex-col items-center animate-fade-in-up transition-transform duration-300 hover:scale-105 hover:shadow-2xl border-2 border-primary/10"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <img src={photo.url} alt={photo.bodyPart} className="rounded-xl max-h-60 object-contain mb-3 border-2 border-primary/20 transition-all duration-300 hover:shadow-lg" />
          <div className="text-xs font-semibold text-primary mb-1">{photo.bodyPart}</div>
          {photo.note && <div className="text-xs text-gray-500 mb-1 italic">{photo.note}</div>}
          <div className="text-xs text-gray-400">{new Date(photo.date).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
} 