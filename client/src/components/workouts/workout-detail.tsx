import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, Dumbbell, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WorkoutSession } from "./workout-session";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
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
  sets: number;
  reps: number;
  duration?: number;
  restTime?: number;
  order: number;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  exercises: Exercise[];
}

interface WorkoutDetailProps {
  workout: WorkoutPlan;
  onBack: () => void;
  onStartWorkout: (workoutId: number) => void;
}

export function WorkoutDetail({ workout, onBack, onStartWorkout }: WorkoutDetailProps) {
  const { toast } = useToast();
  const [showingExerciseId, setShowingExerciseId] = useState<number | null>(null);

  // Show detailed exercise instructions
  const handleShowExercise = (id: number) => {
    setShowingExerciseId(id === showingExerciseId ? null : id);
  };

  // Format workout intensity based on difficulty
  const getIntensityColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <MainLayout
      title={workout.name}
      subtitle={`${workout.duration} minute ${workout.difficulty} workout`}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workouts
          </Button>
          <Button 
            onClick={() => onStartWorkout(workout.id)}
            className="flex items-center gap-2"
          >
            <Dumbbell className="h-4 w-4" />
            Start Workout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Workout Overview</CardTitle>
              <Badge className={getIntensityColor(workout.difficulty)}>
                {workout.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{workout.description}</p>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{workout.duration} min</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Exercises</p>
                  <p className="text-sm text-muted-foreground">{workout.exercises.length} exercises</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-4">Exercise Instructions</h3>
          
          <div className="space-y-4">
            {workout.exercises
              .sort((a, b) => a.order - b.order)
              .map((exerciseItem) => (
                <Card key={exerciseItem.exercise.id} className="overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleShowExercise(exerciseItem.exercise.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{exerciseItem.exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exerciseItem.sets} sets × {exerciseItem.reps} reps
                            {exerciseItem.restTime ? ` • ${exerciseItem.restTime}s rest` : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{exerciseItem.exercise.muscleGroups.join(', ')}</Badge>
                    </div>
                  </div>
                  
                  {showingExerciseId === exerciseItem.exercise.id && (
                    <div className="px-4 pb-4">
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        <p className="text-sm font-semibold">{exerciseItem.exercise.description}</p>
                        
                        {exerciseItem.exercise.imageUrl && (
                          <div className="relative h-40 rounded-md overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                              <p className="text-white p-2 font-medium">{exerciseItem.exercise.name}</p>
                            </div>
                          </div>
                        )}
                        
                        {exerciseItem.exercise.instructions && (
                          <div className="relative flex ">
                            <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-l-4 border-primary/70 rounded-xl shadow-lg px-8 py-6 mb-2 max-w-xl w-full animate-fade-in">
                              <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="h-6 w-6 text-primary animate-pulse" />
                                <span className="font-bold text-primary text-xl tracking-tight">How to Perform</span>
                              </div>
                              <ol className="space-y-4">
                                {exerciseItem.exercise.instructions.map((instruction, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-lg text-gray-800 dark:text-gray-100">
                                    <span className="flex-shrink-0 mt-1"><CheckCircle className="h-5 w-5 text-green-500 animate-bounce" /></span>
                                    <span>{instruction}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                        
                        {exerciseItem.exercise.equipment && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {exerciseItem.exercise.equipment.map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-yellow-400/90 to-yellow-500/80 text-white font-semibold px-4 py-1.5 shadow-md backdrop-blur-sm border border-yellow-300/60 text-sm transition-transform hover:scale-105"
                                style={{ boxShadow: '0 2px 8px 0 rgba(255, 193, 7, 0.10)' }}
                              >
                                <svg className="h-4 w-4 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {exerciseItem.exercise.videoUrl && (
                          <Button variant="outline" className="w-full" size="sm">
                            Watch Video Demonstration
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}