import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ImageOff } from "lucide-react";

export function ProgressPhotoGallery({ filterBodyPart }: { filterBodyPart?: string }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      setLoading(true);
      const res = await apiRequest("GET", "/api/progress-photos");
      const data = res.ok ? await res.json() : [];
      setPhotos(data);
      setLoading(false);
    }
    fetchPhotos();
  }, []);

  const filtered = filterBodyPart ? photos.filter((p) => p.bodyPart === filterBodyPart) : photos;

  if (loading) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/15 py-12 text-muted-foreground dark:bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading photos" />
        <p className="mt-3 text-sm">Loading photos…</p>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-14 text-center dark:bg-muted/10">
        <ImageOff className="h-10 w-10 text-muted-foreground/50" aria-hidden />
        <p className="mt-4 text-base font-medium text-foreground">No photos match this filter</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Try another body area or upload a new shot in the panel beside this one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      {filtered.map((photo, i) => (
        <div
          key={photo.id}
          className="flex flex-col items-center rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <img
            src={photo.url}
            alt={photo.bodyPart}
            className="mb-3 max-h-60 w-full rounded-xl border border-border/50 object-contain"
          />
          <div className="text-xs font-semibold text-primary">{photo.bodyPart}</div>
          {photo.note ? (
            <div className="mt-1 max-w-full truncate text-xs italic text-muted-foreground" title={photo.note}>
              {photo.note}
            </div>
          ) : null}
          <div className="mt-1 text-xs tabular-nums text-muted-foreground">
            {new Date(photo.date).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
