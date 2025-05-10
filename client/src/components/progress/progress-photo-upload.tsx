import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

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
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = "ml_default"; // Use your signed preset name
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      // 1. Get signature from backend
      const timestamp = Math.floor(Date.now() / 1000);
      const sigRes = await fetch("/api/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp, upload_preset: uploadPreset }),
      });
      const { signature } = await sigRes.json();
      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("upload_preset", uploadPreset);
      formData.append("signature", signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error("Upload failed: " + (data.error?.message || JSON.stringify(data)));
      }
      // Save to backend
      await fetch("/api/progress-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.secure_url,
          body_part: bodyPart,
          note
        })
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
    <form onSubmit={handleUpload} className="space-y-4 card bg-white dark:bg-gray-900 shadow p-6 mt-6 mb-4">
      <div>
        <label className="block font-medium mb-1">Progress Photo</label>
        <div
          className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50 dark:bg-gray-800'}`}
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
        <label className="block font-medium mb-1">Note (optional)</label>
        <input
          className="w-full border rounded-full px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. After chest workout"
        />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-full text-lg font-semibold py-3 transition-all" disabled={uploading || !file || !bodyPart}>
        {uploading ? "Uploading..." : "Upload Photo"}
      </Button>
    </form>
  );
} 