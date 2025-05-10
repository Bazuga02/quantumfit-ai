import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Exercise {
  name: string;
  description: string;
  sets: string;
  reps: string;
  restTime: string;
}

interface WorkoutRecommendation {
  title: string;
  description: string;
  exercises: Exercise[];
}

interface Meal {
  name: string;
  description: string;
  protein: string;
  carbs: string;
  fats: string;
  calories: string;
}

interface DailyTotals {
  protein: string;
  carbs: string;
  fats: string;
  calories: string;
}

interface NutritionRecommendation {
  title: string;
  description: string;
  meals: Meal[];
  dailyTotals: DailyTotals;
}

async function geminiJsonPrompt(prompt: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  try {
    return JSON.parse(result.response.text());
  } catch (e) {
    console.error("Gemini raw response:", result.response.text());
    console.error("Failed to parse Gemini response as JSON:", e);
    throw new Error("Failed to parse Gemini response as JSON: " + result.response.text());
  }
}

async function callGeminiAPI(prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get response from Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

function extractJson(text: string): string {
  // Remove code block markers and extract JSON
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  return cleaned;
}

export async function getWorkoutRecommendation(
  userData: {
    goals: string;
    fitnessLevel: string;
    limitations?: string;
    preferredExercises?: string[];
  }
): Promise<WorkoutRecommendation> {
  const prompt = `
    Generate a personalized workout recommendation based on the following user data:
    - Goals: ${userData.goals}
    - Fitness Level: ${userData.fitnessLevel}
    - Limitations/Injuries: ${userData.limitations || "None"}
    - Preferred Exercises: ${userData.preferredExercises?.join(", ") || "No specific preferences"}

    Please provide a detailed workout plan in the following JSON format:
    {
      "title": "Workout Plan Title",
      "description": "Brief description of the workout plan",
      "exercises": [
        {
          "name": "Exercise Name",
          "description": "Detailed description of the exercise",
          "sets": "Number of sets",
          "reps": "Number of reps or duration",
          "restTime": "Rest time between sets"
        }
      ]
    }

    Respond with only the JSON object, no explanations, no markdown, no code blocks. Make sure to address the user's specific goals and limitations in the plan.
  `;

  try {
    const response = await callGeminiAPI(prompt);
    if (response) {
      const jsonStr = extractJson(response);
      const recommendation = JSON.parse(jsonStr);
      return recommendation;
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Gemini API or parsing error: ' + error);
  }

  // If for some reason we reach here, throw a generic error
  throw new Error('Unknown error in getWorkoutRecommendation');
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
  const prompt = `
    Generate a personalized nutrition recommendation based on the following user data:
    - Goals: ${userData.goals}
    - Dietary Restrictions: ${userData.dietaryRestrictions?.join(", ") || "None"}
    - Current Daily Intake: ${JSON.stringify(userData.currentIntake || "Not specified")}
    
    Please provide a detailed nutrition plan in the following JSON format:
    {
      "title": "Nutrition Plan Title",
      "description": "Brief description of the nutrition plan",
      "meals": [
        {
          "name": "Meal Name",
          "description": "Detailed description of the meal",
          "protein": "Protein content in grams",
          "carbs": "Carbohydrate content in grams",
          "fats": "Fat content in grams",
          "calories": "Total calories"
        }
      ],
      "dailyTotals": {
        "protein": "Total daily protein in grams",
        "carbs": "Total daily carbs in grams",
        "fats": "Total daily fats in grams",
        "calories": "Total daily calories"
      }
    }
    
    Respond with only the JSON object, no explanations, no markdown, no code blocks. Make sure to address the user's specific goals and dietary restrictions in the plan.
  `;

  try {
    const response = await callGeminiAPI(prompt);
    if (response) {
      const jsonStr = extractJson(response);
      const recommendation = JSON.parse(jsonStr);
      return recommendation;
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Gemini API or parsing error: ' + error);
  }

  // If for some reason we reach here, throw a generic error
  throw new Error('Unknown error in getNutritionRecommendation');
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
  return await geminiJsonPrompt(prompt);
}
