import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Info, Check, Play, Clock, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ExerciseDetailProps {
  exercise: {
    id: number;
    name: string;
    description: string;
    muscleGroups: string[];
    equipment?: string[];
    difficulty?: string;
    instructions?: string[];
    videoUrl?: string;
    imageUrl?: string;
  };
  onBack: () => void;
}

export function ExerciseDetail({ exercise, onBack }: ExerciseDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{exercise.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              {exercise.muscleGroups.map((group) => (
                <Badge key={group} variant="secondary">{group}</Badge>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground mt-1">{exercise.description}</p>
            </div>

            <Separator />

            {exercise.equipment && (
              <div>
                <h3 className="text-lg font-semibold">Equipment</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {exercise.equipment.map((item) => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {exercise.instructions && (
              <div>
                <h3 className="text-lg font-semibold">Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  {exercise.instructions.map((instruction, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Difficulty:</span>
                <Badge variant="outline" className={
                  exercise.difficulty === "beginner" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                    : exercise.difficulty === "intermediate" 
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" 
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }>
                  {exercise.difficulty || "Intermediate"}
                </Badge>
              </div>
            </div>

            {exercise.videoUrl && (
              <div className="pt-2">
                <Button className="w-full" size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Video Tutorial
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Recommended Sets</p>
                <p className="text-2xl font-bold">3-4 sets</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Recommended Reps</p>
                <p className="text-2xl font-bold">8-12 reps</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}