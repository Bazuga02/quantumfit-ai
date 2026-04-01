import { ProgressPhotoUpload } from "./progress-photo-upload";
import { ProgressPhotoGallery } from "./progress-photo-gallery";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, LayoutGrid } from "lucide-react";

const bodyParts = [
  "All",
  "Full Body",
  "Chest",
  "Back",
  "Arms",
  "Waist",
  "Hips",
  "Thighs",
  "Other",
];

export function ProgressPhotosTab({
  refreshPhotos,
  setRefreshPhotos,
}: {
  refreshPhotos: number;
  setRefreshPhotos: (fn: (r: number) => number) => void;
}) {
  const [selectedPart, setSelectedPart] = useState<string>("All");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
        <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/90 to-primary py-5 text-primary-foreground">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Camera className="h-5 w-5" aria-hidden />
            </span>
            Upload photo
          </CardTitle>
          <CardDescription className="text-base leading-relaxed !text-primary-foreground/90">
            Add a dated shot by body area — great for side-by-side motivation.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-card p-6">
          <ProgressPhotoUpload onUpload={() => setRefreshPhotos((r) => r + 1)} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-lg ring-1 ring-primary/5">
        <CardHeader className="border-b border-border/50 bg-muted/30 py-5 dark:bg-muted/15">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <LayoutGrid className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">Gallery</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Filter by body part or browse everything.
                </CardDescription>
              </div>
            </div>
            <Select value={selectedPart} onValueChange={setSelectedPart}>
              <SelectTrigger className="w-full rounded-xl sm:w-[200px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {bodyParts.map((bp) => (
                  <SelectItem key={bp} value={bp}>
                    {bp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="bg-card p-6">
          <ProgressPhotoGallery key={refreshPhotos} filterBodyPart={selectedPart === "All" ? undefined : selectedPart} />
        </CardContent>
      </Card>
    </div>
  );
}
