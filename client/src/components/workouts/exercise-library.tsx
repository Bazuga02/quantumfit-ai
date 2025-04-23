import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Dumbbell, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ExerciseDetail } from "./exercise-detail";
import { MainLayout } from "@/components/layout/main-layout";

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['/api/exercises'],
  });

  // Filtered exercises based on search term
  const filteredExercises = exercises
    ? exercises.filter((exercise: any) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some((group: string) => 
          group.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  const handleExerciseClick = (exercise: any) => {
    setSelectedExercise(exercise);
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
  };

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
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search exercises or muscle groups..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-14"></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <Card 
                key={exercise.id} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleExerciseClick(exercise)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.muscleGroups.join(", ")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-1">No exercises found</p>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search term or browse all exercises
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}