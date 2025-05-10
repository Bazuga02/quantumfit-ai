import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// Initial exercises data
const initialExercises = [
  {
    name: "Bench Press",
    description: "A compound exercise that primarily targets the chest muscles",
    muscleGroups: ["chest", "shoulders", "triceps"],
    equipment: ["barbell", "bench"],
    difficulty: "intermediate",
    instructions: [
      "Lie on a flat bench with your feet flat on the ground",
      "Grip the barbell slightly wider than shoulder width",
      "Lower the bar to your chest with control",
      "Press the bar back up to the starting position"
    ]
  },
  {
    name: "Squats",
    description: "A fundamental lower body compound exercise",
    muscleGroups: ["quadriceps", "hamstrings", "glutes"],
    equipment: ["barbell", "squat rack"],
    difficulty: "intermediate",
    instructions: [
      "Position the bar on your upper back",
      "Stand with feet shoulder-width apart",
      "Lower your body by bending your knees and hips",
      "Return to the starting position by extending your legs"
    ]
  },
  {
    name: "Deadlift",
    description: "A powerful compound exercise for overall strength",
    muscleGroups: ["back", "glutes", "hamstrings"],
    equipment: ["barbell"],
    difficulty: "advanced",
    instructions: [
      "Stand with feet hip-width apart",
      "Bend at hips and knees to grip the bar",
      "Keep your back straight and chest up",
      "Stand up straight while holding the bar"
    ]
  }
];

// Additional exercises data
const additionalExercises = [
  {
    name: "Pull-ups",
    description: "A compound exercise that targets the back and biceps",
    muscleGroups: ["back", "biceps", "shoulders"],
    equipment: ["pull-up bar"],
    difficulty: "intermediate",
    instructions: [
      "Grip the bar with hands slightly wider than shoulder width",
      "Hang with arms fully extended",
      "Pull your body up until your chin clears the bar",
      "Lower yourself back down with control"
    ]
  },
  {
    name: "Push-ups",
    description: "A bodyweight exercise that targets the chest, shoulders, and triceps",
    muscleGroups: ["chest", "shoulders", "triceps"],
    equipment: ["none"],
    difficulty: "beginner",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulders",
      "Lower your body until your chest nearly touches the ground",
      "Push back up to the starting position",
      "Keep your core tight throughout the movement"
    ]
  },
  {
    name: "Lunges",
    description: "A lower body exercise that targets the legs and glutes",
    muscleGroups: ["quadriceps", "hamstrings", "glutes"],
    equipment: ["none"],
    difficulty: "beginner",
    instructions: [
      "Stand with feet hip-width apart",
      "Step forward with one leg and lower your body",
      "Keep your front knee above your ankle",
      "Push back to the starting position"
    ]
  },
  {
    name: "Overhead Press",
    description: "A compound exercise that targets the shoulders and triceps",
    muscleGroups: ["shoulders", "triceps", "upper chest"],
    equipment: ["barbell", "dumbbells"],
    difficulty: "intermediate",
    instructions: [
      "Hold the weight at shoulder level",
      "Press the weight overhead until arms are fully extended",
      "Lower the weight back to shoulder level",
      "Keep your core tight throughout the movement"
    ]
  },
  {
    name: "Bent-over Rows",
    description: "A compound exercise that targets the back muscles",
    muscleGroups: ["back", "biceps", "shoulders"],
    equipment: ["barbell", "dumbbells"],
    difficulty: "intermediate",
    instructions: [
      "Bend at the hips with a slight bend in the knees",
      "Hold the weight with arms extended",
      "Pull the weight towards your torso",
      "Lower the weight back down with control"
    ]
  },
  {
    name: "Romanian Deadlift",
    description: "A variation of the deadlift that emphasizes the hamstrings",
    muscleGroups: ["hamstrings", "glutes", "lower back"],
    equipment: ["barbell", "dumbbells"],
    difficulty: "intermediate",
    instructions: [
      "Hold the weight in front of your thighs",
      "Hinge at the hips while keeping your back straight",
      "Lower the weight until you feel a stretch in your hamstrings",
      "Return to the starting position by extending your hips"
    ]
  },
  {
    name: "Dumbbell Flyes",
    description: "An isolation exercise that targets the chest muscles",
    muscleGroups: ["chest", "shoulders"],
    equipment: ["dumbbells", "bench"],
    difficulty: "intermediate",
    instructions: [
      "Lie on a bench with dumbbells above your chest",
      "Lower the weights out to the sides with a slight bend in elbows",
      "Bring the weights back up in an arc motion",
      "Keep a slight bend in your elbows throughout"
    ]
  },
  {
    name: "Lat Pulldown",
    description: "A machine exercise that targets the back muscles",
    muscleGroups: ["back", "biceps", "shoulders"],
    equipment: ["cable machine"],
    difficulty: "beginner",
    instructions: [
      "Sit at the lat pulldown machine with thighs under the pad",
      "Grip the bar slightly wider than shoulder width",
      "Pull the bar down to your upper chest",
      "Control the bar back to the starting position"
    ]
  },
  {
    name: "Leg Press",
    description: "A machine exercise that targets the lower body",
    muscleGroups: ["quadriceps", "hamstrings", "glutes"],
    equipment: ["leg press machine"],
    difficulty: "beginner",
    instructions: [
      "Sit in the leg press machine with feet on the platform",
      "Release the safety handles and lower the weight",
      "Press the platform back up to the starting position",
      "Keep your back flat against the pad throughout"
    ]
  },
  {
    name: "Calf Raises",
    description: "An isolation exercise that targets the calf muscles",
    muscleGroups: ["calves"],
    equipment: ["calf raise machine", "dumbbells"],
    difficulty: "beginner",
    instructions: [
      "Stand with the balls of your feet on the edge of a step",
      "Lower your heels below the step",
      "Raise up onto your toes as high as possible",
      "Lower back down with control"
    ]
  },
  {
    name: "Bicep Curls",
    description: "An isolation exercise that targets the biceps",
    muscleGroups: ["biceps"],
    equipment: ["dumbbells", "barbell", "cable machine"],
    difficulty: "beginner",
    instructions: [
      "Hold the weight with palms facing forward",
      "Curl the weight up towards your shoulders",
      "Lower the weight back down with control",
      "Keep your elbows close to your sides"
    ]
  },
  {
    name: "Tricep Dips",
    description: "A bodyweight exercise that targets the triceps",
    muscleGroups: ["triceps", "chest", "shoulders"],
    equipment: ["parallel bars", "bench"],
    difficulty: "intermediate",
    instructions: [
      "Support your weight on the bars with arms straight",
      "Lower your body by bending your elbows",
      "Push back up to the starting position",
      "Keep your elbows close to your body"
    ]
  },
  {
    name: "Plank",
    description: "A core exercise that improves stability",
    muscleGroups: ["core", "shoulders"],
    equipment: ["none"],
    difficulty: "beginner",
    instructions: [
      "Start in a push-up position with forearms on the ground",
      "Keep your body in a straight line from head to heels",
      "Hold the position while keeping your core tight",
      "Maintain proper breathing throughout"
    ]
  },
  {
    name: "Russian Twists",
    description: "A core exercise that targets the obliques",
    muscleGroups: ["core", "obliques"],
    equipment: ["medicine ball", "dumbbell"],
    difficulty: "intermediate",
    instructions: [
      "Sit on the ground with knees bent and feet elevated",
      "Hold a weight in front of your chest",
      "Rotate your torso from side to side",
      "Keep your back straight throughout the movement"
    ]
  },
  {
    name: "Hanging Leg Raises",
    description: "An advanced core exercise",
    muscleGroups: ["core", "hip flexors"],
    equipment: ["pull-up bar"],
    difficulty: "advanced",
    instructions: [
      "Hang from a pull-up bar with arms fully extended",
      "Raise your legs until they're parallel to the ground",
      "Lower your legs back down with control",
      "Keep your body stable throughout the movement"
    ]
  },
  {
    name: "Face Pulls",
    description: "An exercise that targets the upper back and rear deltoids",
    muscleGroups: ["upper back", "rear deltoids"],
    equipment: ["cable machine", "resistance band"],
    difficulty: "intermediate",
    instructions: [
      "Set the cable at face height",
      "Pull the rope towards your face",
      "Squeeze your shoulder blades together",
      "Return to the starting position with control"
    ]
  },
  {
    name: "Lateral Raises",
    description: "An isolation exercise that targets the side deltoids",
    muscleGroups: ["shoulders"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    instructions: [
      "Hold dumbbells at your sides",
      "Raise your arms out to the sides until parallel to the ground",
      "Lower the weights back down with control",
      "Keep a slight bend in your elbows"
    ]
  },
  {
    name: "Front Raises",
    description: "An isolation exercise that targets the front deltoids",
    muscleGroups: ["shoulders", "upper chest"],
    equipment: ["dumbbells", "barbell"],
    difficulty: "beginner",
    instructions: [
      "Hold the weight in front of your thighs",
      "Raise the weight up to shoulder height",
      "Lower the weight back down with control",
      "Keep your core tight throughout"
    ]
  },
  {
    name: "Reverse Flyes",
    description: "An exercise that targets the rear deltoids and upper back",
    muscleGroups: ["rear deltoids", "upper back"],
    equipment: ["dumbbells", "cable machine"],
    difficulty: "intermediate",
    instructions: [
      "Bend at the hips with a slight bend in the knees",
      "Hold the weights with arms extended",
      "Raise your arms out to the sides",
      "Squeeze your shoulder blades together"
    ]
  },
  {
    name: "Hip Thrusts",
    description: "An exercise that targets the glutes and hamstrings",
    muscleGroups: ["glutes", "hamstrings"],
    equipment: ["barbell", "bench"],
    difficulty: "intermediate",
    instructions: [
      "Sit on the ground with your upper back against a bench",
      "Place a barbell across your hips",
      "Drive through your heels to lift your hips",
      "Squeeze your glutes at the top"
    ]
  },
  {
    name: "Bulgarian Split Squats",
    description: "A unilateral exercise that targets the legs",
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    equipment: ["dumbbells", "bench"],
    difficulty: "intermediate",
    instructions: [
      "Place one foot on a bench behind you",
      "Lower your body until your front thigh is parallel to the ground",
      "Push back up to the starting position",
      "Keep your torso upright throughout"
    ]
  },
  {
    name: "Box Jumps",
    description: "A plyometric exercise that improves explosive power",
    muscleGroups: ["quadriceps", "glutes", "calves"],
    equipment: ["plyo box"],
    difficulty: "intermediate",
    instructions: [
      "Stand in front of a box with feet shoulder-width apart",
      "Swing your arms and jump onto the box",
      "Land softly with both feet on the box",
      "Step down carefully and repeat"
    ]
  }
];

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

const main = async () => {
  try {
    // Skip migration since tables already exist
    console.log('Checking for existing exercises...');
    const existingExercises = await db.select().from(schema.exercises);
    
    if (existingExercises.length === 0) {
      console.log('Seeding initial exercises...');
      for (const exercise of initialExercises) {
        await db.insert(schema.exercises).values(exercise);
      }
      console.log('Initial exercises seeded successfully!');
    } else {
      console.log('Exercises already exist, skipping seed data.');
    }

    console.log('Adding new exercises...');
    for (const exercise of additionalExercises) {
      await db.insert(schema.exercises).values(exercise);
    }
    console.log('Successfully added new exercises!');
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

main(); 