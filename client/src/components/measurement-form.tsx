import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export function MeasurementForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    weight: "",
    bodyFat: "",
    chest: "",
    waist: "",
    hips: "",
    arms: "",
    thighs: ""
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/measurements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          weight: parseFloat(data.weight),
          bodyFat: parseFloat(data.bodyFat),
          chest: parseFloat(data.chest),
          waist: parseFloat(data.waist),
          hips: parseFloat(data.hips),
          arms: parseFloat(data.arms),
          thighs: parseFloat(data.thighs),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add measurement");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/measurements'] });
      toast({
        title: "Success",
        description: "Measurements added successfully!",
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add measurements",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 card bg-white dark:bg-gray-900 shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={handleChange}
            required
            className="rounded-lg h-10"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="bodyFat">Body Fat (%)</Label>
          <Input
            id="bodyFat"
            name="bodyFat"
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={handleChange}
            required
            className="rounded-lg h-10"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="chest">Chest (cm)</Label>
          <Input
            id="chest"
            name="chest"
            type="number"
            step="0.1"
            value={formData.chest}
            onChange={handleChange}
            required
            className="rounded-lg h-10"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="waist">Waist (cm)</Label>
          <Input
            id="waist"
            name="waist"
            type="number"
            step="0.1"
            value={formData.waist}
            onChange={handleChange}
            required
            className="rounded-lg h-10"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="hips">Hips (cm)</Label>
          <Input
            id="hips"
            name="hips"
            type="number"
            step="0.1"
            value={formData.hips}
            onChange={handleChange}
            required
            className="rounded-lg h-10"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="arms">Arms (cm)</Label>
          <Input
            id="arms"
            name="arms"
            type="number"
            step="0.1"
            value={formData.arms}
            onChange={handleChange}
            required
            className="rounded-lg h-10"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="thighs">Thighs (cm)</Label>
          <Input
            id="thighs"
            name="thighs"
            type="number"
            step="0.1"
            value={formData.thighs}
            onChange={handleChange}
            required
            className="rounded-lg h-10"
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg text-base font-semibold py-2 transition-all" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save Measurements"}
      </Button>
    </form>
  );
} 