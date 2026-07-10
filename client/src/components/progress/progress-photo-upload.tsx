import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

const bodyParts = [
  "Full Body",
  "Chest",
  "Back",
  "Arms",
  "Waist",
  "Hips",
  "Thighs",
  "Other"
];

export function ProgressPhotoUpload({ onUpload }: { onUpload?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [bodyPart, setBodyPart] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setPreview(URL.createObjectURL(e.dataTransfer.files[0]));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !bodyPart) return;
    setUploading(true);
    try {
      const sigRes = await apiRequest("POST", "/api/cloudinary-signature");
      if (!sigRes.ok) {
        const err = await sigRes.json();
        throw new Error(err.message || "Failed to prepare upload");
      }

      const { signature, timestamp, api_key, cloud_name, folder } = await sigRes.json();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error("Upload failed: " + (data.error?.message || JSON.stringify(data)));
      }

      await apiRequest("POST", "/api/progress-photos", {
        url: data.secure_url,
        body_part: bodyPart,
        note,
      });
      setFile(null);
      setPreview(null);
      setBodyPart("");
      setNote("");
      if (onUpload) onUpload();
    } catch (err) {
      alert('error: ' + (err instanceof Error ? err.message : err));
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleUpload} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">Photo</label>
        <div
          className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
            dragActive
              ? "border-primary bg-primary/10"
              : "border-border/70 bg-muted/25 hover:border-primary/35 dark:bg-muted/15"
          }`}
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={inputRef}
            className="hidden"
          />
          {preview ? (
            <img src={preview} alt="Preview" className="rounded-lg max-h-40 mb-2" />
          ) : (
            <span className="text-gray-400 text-sm">Drag & drop or click to select a photo</span>
          )}
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Body Part</label>
        <select
          className="w-full border rounded-full px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={bodyPart}
          onChange={e => setBodyPart(e.target.value)}
          required
        >
          <option value="">Select body part</option>
          {bodyParts.map(bp => (
            <option key={bp} value={bp}>{bp}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">Note (optional)</label>
        <input
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. After chest workout"
        />
      </div>
      <Button type="submit" className="h-11 w-full rounded-xl text-base font-semibold" disabled={uploading || !file || !bodyPart}>
        {uploading ? "Uploading..." : "Upload Photo"}
      </Button>
    </form>
  );
} 