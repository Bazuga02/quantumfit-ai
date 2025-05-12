import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle, Timer, RotateCcw, Dumbbell, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  exercise: {
    id: number;
    name: string;
    description: string;
    muscleGroups: string[];
    instructions?: string[];
  };
  sets: number;
  reps: number;
  duration?: number;
  restTime?: number;
}

interface WorkoutSession {
  id: number;
  planId: number;
  planName: string;
  startTime: string;
  userId: number;
  exercises: Exercise[];
  inProgress: boolean;
}

interface WorkoutSessionProps {
  session: WorkoutSession;
  onComplete: () => void;
  onExit: () => void;
}

export function WorkoutSession({ session, onComplete, onExit }: WorkoutSessionProps) {
  const { toast } = useToast();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60); // Default rest time
  
  // Ensure exercises array exists and has length
  if (!session.exercises || session.exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No Exercises Found</h2>
          <p className="text-muted-foreground mb-4">
            This workout plan doesn't have any exercises. Please add some exercises to the plan.
          </p>
          <Button variant="outline" onClick={onExit}>
            Exit Workout
          </Button>
        </div>
      </div>
    );
  }
  
  const totalExercises = session.exercises.length;
  const currentExercise = session.exercises[currentExerciseIndex];
  const progress = (completedExercises.length / totalExercises) * 100;
  
  // Set rest time based on current exercise
  useEffect(() => {
    // When starting a rest period, update rest time to the next exercise's rest time
    if (isResting && currentExerciseIndex < totalExercises - 1) {
      const nextExercise = session.exercises[currentExerciseIndex + 1];
      setRestTime(nextExercise.restTime || 60);
    }
  }, [isResting, currentExerciseIndex, session.exercises, totalExercises]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (isResting) {
        if (restTime > 0) {
          setRestTime(prev => prev - 1);
        } else {
          setIsResting(false);
          // Move to next exercise after rest period
          setCurrentExerciseIndex(prev => prev + 1);
        }
      } else {
        setTimer(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isResting, restTime]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Complete current exercise and move to next
  const completeExercise = () => {
    setCompletedExercises(prev => [...prev, currentExerciseIndex]);
    
    if (currentExerciseIndex < totalExercises - 1) {
      // If not the last exercise, start rest period
      setIsResting(true);
    } else {
      // If last exercise, complete workout
      toast({
        title: "Workout Completed!",
        description: `You completed ${session.planName} in ${formatTime(timer)}`,
      });
      onComplete();
    }
  };
  
  // Skip rest period
  const skipRest = () => {
    setIsResting(false);
    setRestTime(60);
    setCurrentExerciseIndex(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onExit}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Exit Workout
        </Button>
        <div className="flex items-center">
          <Timer className="mr-2 h-5 w-5 text-muted-foreground" />
          <span className="font-mono text-lg">{formatTime(timer)}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-xl font-bold">{session.planName}</h2>
        <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s' }} />
        </div>
        <p className="text-sm text-muted-foreground">
          {completedExercises.length} of {totalExercises} exercises completed
        </p>
      </div>
      
      {isResting ? (
        <Card className="border-2 border-primary bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-2xl flex items-center justify-center min-h-[400px] w-full max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center w-full py-10 px-4">
            <Dumbbell className="h-12 w-12 text-primary mb-6 animate-bounce" />
            <CardTitle className="text-3xl font-extrabold tracking-tight mb-4 text-center">Rest Period</CardTitle>
            <div className="relative flex items-center justify-center mb-6" style={{ width: 120, height: 120 }}>
              <svg className="absolute top-0 left-0" width="120" height="120">
                <circle cx="60" cy="60" r="54" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                <circle
                  cx="60" cy="60" r="54"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={(1 - restTime / (session.exercises[currentExerciseIndex + 1]?.restTime || 60)) * 2 * Math.PI * 54}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-5xl font-extrabold z-10 text-primary drop-shadow-lg flex items-center justify-center w-full h-full">{restTime}s</span>
            </div>
            <p className="text-lg text-muted-foreground font-medium mb-8 text-center max-w-xs mx-auto">Take a breather before the next exercise</p>
            <Button onClick={skipRest} className="px-10 py-3 text-lg font-semibold rounded-full shadow-md hover:scale-105 transition-transform flex items-center gap-2 mt-2">
              <SkipForward className="mr-2 h-5 w-5" />
              Skip Rest
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-1">
              <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium py-1 px-3 rounded-full">
                Exercise {currentExerciseIndex + 1} of {totalExercises}
              </div>
            </div>
            <CardTitle>{currentExercise.exercise.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {currentExercise.exercise.muscleGroups.join(", ")}
                </p>
                <p className="font-medium">
                  {currentExercise.sets} sets • {currentExercise.reps} reps
                  {currentExercise.restTime ? ` • ${currentExercise.restTime}s rest` : ''}
                </p>
              </div>
            </div>
            
            <div className="border-t border-b border-border py-4">
              <p className="text-sm mb-4">{currentExercise.exercise.description}</p>
              <hr className="my-6 border-gray-200 dark:border-gray-700" />
              {currentExercise.exercise.instructions && currentExercise.exercise.instructions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm px-6 py-4 mb-2 max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-primary animate-pulse" />
                    <span className="font-semibold text-primary text-lg">How to Perform</span>
                  </div>
                  <ol className="space-y-2">
                    {currentExercise.exercise.instructions.map((instruction: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-base text-gray-700 dark:text-gray-200">
                        <span className="mt-1"><CheckCircle className="h-4 w-4 text-green-500 animate-bounce" /></span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setCurrentExerciseIndex(prev => prev > 0 ? prev - 1 : 0)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={completeExercise}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}