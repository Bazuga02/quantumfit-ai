import { db } from '../server/db';
import { exercises } from '../shared/schema';

const additionalExercises = [
  {
    name: "Pull-ups",
    description: "A compound exercise that targets the back and biceps",
    muscle_groups: ["back", "biceps", "shoulders"],
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
    muscle_groups: ["chest", "shoulders", "triceps"],
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
    muscle_groups: ["quadriceps", "hamstrings", "glutes"],
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
    muscle_groups: ["shoulders", "triceps", "upper chest"],
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
    muscle_groups: ["back", "biceps", "shoulders"],
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
    muscle_groups: ["hamstrings", "glutes", "lower back"],
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
    muscle_groups: ["chest", "shoulders"],
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
    muscle_groups: ["back", "biceps", "shoulders"],
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
    muscle_groups: ["quadriceps", "hamstrings", "glutes"],
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
    muscle_groups: ["calves"],
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
    muscle_groups: ["biceps"],
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
    muscle_groups: ["triceps", "chest", "shoulders"],
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
    muscle_groups: ["core", "shoulders"],
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
    muscle_groups: ["core", "obliques"],
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
    muscle_groups: ["core", "hip flexors"],
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
    muscle_groups: ["upper back", "rear deltoids"],
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
    muscle_groups: ["shoulders"],
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
    muscle_groups: ["shoulders", "upper chest"],
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
    muscle_groups: ["rear deltoids", "upper back"],
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
    muscle_groups: ["glutes", "hamstrings"],
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
    muscle_groups: ["quadriceps", "glutes", "hamstrings"],
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
    muscle_groups: ["quadriceps", "glutes", "calves"],
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

async function seedExercises() {
  try {
    console.log('Seeding exercises...');
    await db.insert(exercises).values(additionalExercises);
    console.log('Successfully seeded exercises!');
  } catch (error) {
    console.error('Error seeding exercises:', error);
  }
}

seedExercises(); 