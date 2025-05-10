import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Dumbbell, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExerciseDetail } from "./exercise-detail";
import { MainLayout } from "@/components/layout/main-layout";
import { apiRequest } from "@/lib/queryClient";

interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty?: string;
  instructions?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const { data: exercises = [], isLoading, error } = useQuery<Exercise[]>({
    queryKey: ['exercises', searchTerm, selectedMuscleGroup],
    queryFn: async () => {
   
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (selectedMuscleGroup) params.append('muscleGroup', selectedMuscleGroup);
      
      const response = await apiRequest('GET', `/api/exercises?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }
      const data = await response.json();
      return data;
    }
  });

 

  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
    'Legs', 'Core', 'Full Body', 'Cardio'
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || 
      exercise.muscleGroups.includes(selectedMuscleGroup);
    return matchesSearch && matchesMuscleGroup;
  });


  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
  };

  if (isLoading) {
    return <div>Loading exercises...</div>;
  }

  if (error) {
    return <div>Error loading exercises. Please try again.</div>;
  }

  // If an exercise is selected, show its details
  if (selectedExercise) {
    return (
      <MainLayout
        title={selectedExercise.name}
        subtitle={selectedExercise.muscleGroups.join(", ")}
      >
        <ExerciseDetail
          exercise={selectedExercise}
          onBack={handleBackToList}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Exercise Library"
      subtitle="Browse and learn about different exercises"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((group) => (
            <Badge
              key={group}
              variant={selectedMuscleGroup === group ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedMuscleGroup(
                selectedMuscleGroup === group ? null : group
              )}
            >
              {group}
            </Badge>
          ))}
        </div>

        <ScrollArea className="h-[600px] rounded-md border p-4">
          <div className="grid gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{exercise.name}</span>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {exercise.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscleGroups.map((group) => (
                      <Badge key={group} variant="secondary">
                        {group}
                      </Badge>
                    ))}
                  </div>
                  {exercise.equipment.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {exercise.equipment.join(', ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
}