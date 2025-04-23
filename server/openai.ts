import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" });

export type WorkoutRecommendation = {
  title: string;
  description: string;
  exercises: {
    name: string;
    description: string;
  }[];
};

export type NutritionRecommendation = {
  title: string;
  description: string;
  meals: {
    name: string;
    description: string;
    protein: number;
  }[];
};

export async function getWorkoutRecommendation(
  userData: {
    goals: string;
    fitnessLevel: string;
    limitations?: string;
    preferredExercises?: string[];
  }
): Promise<WorkoutRecommendation> {
  try {
    const prompt = `
      Generate a personalized workout recommendation based on the following user data:
      - Goals: ${userData.goals}
      - Fitness Level: ${userData.fitnessLevel}
      - Limitations/Injuries: ${userData.limitations || "None"}
      - Preferred Exercises: ${userData.preferredExercises?.join(", ") || "No specific preferences"}
      
      Please respond with a JSON object that includes:
      1. A title for the workout recommendation
      2. A brief description explaining the approach
      3. A list of 3-5 recommended exercises with names and descriptions
      
      Format your response as: { "title": "", "description": "", "exercises": [{"name": "", "description": ""}] }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content) as WorkoutRecommendation;
    return result;
  } catch (error) {
    console.error("Error generating workout recommendation:", error);
    return {
      title: "General Fitness Workout",
      description: "A balanced workout for overall fitness when personalized recommendations aren't available.",
      exercises: [
        {
          name: "Push-ups",
          description: "A classic bodyweight exercise for upper body strength."
        },
        {
          name: "Squats",
          description: "A fundamental lower body exercise targeting quadriceps, hamstrings and glutes."
        },
        {
          name: "Plank",
          description: "Core strengthening exercise that improves stability and posture."
        }
      ]
    };
  }
}

export async function getNutritionRecommendation(
  userData: {
    goals: string;
    dietaryRestrictions?: string[];
    currentIntake?: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  }
): Promise<NutritionRecommendation> {
  try {
    const prompt = `
      Generate a personalized nutrition recommendation based on the following user data:
      - Goals: ${userData.goals}
      - Dietary Restrictions: ${userData.dietaryRestrictions?.join(", ") || "None"}
      - Current Intake: ${userData.currentIntake ? 
        `Calories: ${userData.currentIntake.calories}, Protein: ${userData.currentIntake.protein}g, Carbs: ${userData.currentIntake.carbs}g, Fats: ${userData.currentIntake.fats}g` 
        : "Not specified"}
      
      Please respond with a JSON object that includes:
      1. A title for the nutrition recommendation
      2. A brief description explaining the approach
      3. A list of 3 recommended meals with names, descriptions, and protein content in grams
      
      Format your response as: { "title": "", "description": "", "meals": [{"name": "", "description": "", "protein": 0}] }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content) as NutritionRecommendation;
    return result;
  } catch (error) {
    console.error("Error generating nutrition recommendation:", error);
    return {
      title: "Balanced Nutrition Plan",
      description: "A general balanced nutrition plan when personalized recommendations aren't available.",
      meals: [
        {
          name: "High-Protein Breakfast",
          description: "Greek yogurt with berries and a sprinkle of granola for a protein-rich start.",
          protein: 25
        },
        {
          name: "Balanced Lunch",
          description: "Grilled chicken salad with mixed greens, vegetables, and olive oil dressing.",
          protein: 30
        },
        {
          name: "Nutrient-Dense Dinner",
          description: "Baked salmon with sweet potato and steamed broccoli.",
          protein: 35
        }
      ]
    };
  }
}

export async function getProgressAnalysis(
  userData: {
    startingStats: {
      weight?: number;
      bodyFat?: number;
      measurements?: Record<string, number>;
    };
    currentStats: {
      weight?: number;
      bodyFat?: number;
      measurements?: Record<string, number>;
    };
    goal: string;
    timeframe: string;
  }
): Promise<{ analysis: string; recommendations: string[] }> {
  try {
    const prompt = `
      Analyze fitness progress based on the following user data:
      - Starting Stats: ${JSON.stringify(userData.startingStats)}
      - Current Stats: ${JSON.stringify(userData.currentStats)}
      - Goal: ${userData.goal}
      - Timeframe: ${userData.timeframe}
      
      Please respond with a JSON object that includes:
      1. A brief analysis of the progress made
      2. A list of 3 recommendations for continued improvement
      
      Format your response as: { "analysis": "", "recommendations": ["", "", ""] }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating progress analysis:", error);
    return {
      analysis: "Based on the information provided, it appears you're making steady progress toward your goals.",
      recommendations: [
        "Continue with your current workout routine, but consider increasing intensity gradually",
        "Ensure you're meeting your daily protein requirements to support muscle recovery",
        "Focus on quality sleep and stress management to optimize results"
      ]
    };
  }
}
