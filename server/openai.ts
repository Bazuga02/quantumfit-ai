/**
 * AI Coach — Groq (OpenAI-compatible). Fast, free tier.
 * Responses are validated with Zod so the frontend always gets the same format.
 */

import Groq from "groq-sdk";
import { z } from "zod";

// Lazy client so API key is read after dotenv loads
function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey });
}

const MODEL = "llama-3.1-8b-instant";

// --- Response schemas (guaranteed format for frontend) ---

const ExerciseSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  sets: z.string().default(""),
  reps: z.string().default(""),
  restTime: z.string().default(""),
});

const WorkoutRecommendationSchema = z.object({
  title: z.string().default("Workout Plan"),
  description: z.string().default(""),
  exercises: z.array(ExerciseSchema).default([]),
});

const MealSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  protein: z.string().default(""),
  carbs: z.string().default(""),
  fats: z.string().default(""),
  calories: z.string().default(""),
});

const DailyTotalsSchema = z.object({
  protein: z.string().default(""),
  carbs: z.string().default(""),
  fats: z.string().default(""),
  calories: z.string().default(""),
});

const NutritionRecommendationSchema = z.object({
  title: z.string().default("Nutrition Plan"),
  description: z.string().default(""),
  meals: z.array(MealSchema).default([]),
  dailyTotals: DailyTotalsSchema.default({ protein: "", carbs: "", fats: "", calories: "" }),
});

const ProgressAnalysisSchema = z.object({
  analysis: z.string().default(""),
  recommendations: z.array(z.string()).default([]),
});

export type WorkoutRecommendation = z.infer<typeof WorkoutRecommendationSchema>;
export type NutritionRecommendation = z.infer<typeof NutritionRecommendationSchema>;

// --- Single helper: Groq chat + JSON parse ---

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  const firstBrace = trimmed.indexOf("{");
  if (firstBrace === -1) return trimmed;
  let depth = 0;
  let end = firstBrace;
  for (let i = firstBrace; i < trimmed.length; i++) {
    if (trimmed[i] === "{") depth++;
    if (trimmed[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return trimmed.slice(firstBrace, end);
}

async function generateJson<T = unknown>(prompt: string): Promise<T> {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content;
  if (raw == null || raw === "") {
    console.error("Groq returned no content:", JSON.stringify(completion, null, 2));
    throw new Error("Groq returned empty response");
  }

  try {
    const jsonStr = extractJson(raw);
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Groq JSON parse error. Raw:", raw);
    throw new Error("Groq returned invalid JSON");
  }
}

// --- Prompts: ask for JSON only (no schema in API, so prompt clearly) ---

export async function getWorkoutRecommendation(userData: {
  goals: string;
  fitnessLevel: string;
  limitations?: string;
  preferredExercises?: string[];
}): Promise<WorkoutRecommendation> {
  const prompt = `You are a fitness coach. Return ONLY a valid JSON object, no other text or markdown.

User context:
- Goals: ${userData.goals}
- Fitness level: ${userData.fitnessLevel}
- Limitations/injuries: ${userData.limitations || "None"}
- Preferred exercises: ${userData.preferredExercises?.join(", ") || "None"}

Return exactly this JSON structure:
{
  "title": "workout plan title",
  "description": "brief description of the plan",
  "exercises": [
    {
      "name": "exercise name",
      "description": "short description",
      "sets": "e.g. 3",
      "reps": "e.g. 10 or 30s",
      "restTime": "e.g. 60s"
    }
  ]
}

Include 4-6 exercises. Address the user's goals and limitations. Output only the JSON object.`;

  const raw = await generateJson<unknown>(prompt);
  return WorkoutRecommendationSchema.parse(raw);
}

export async function getNutritionRecommendation(userData: {
  goals: string;
  dietaryRestrictions?: string[];
  currentIntake?: { calories: number; protein: number; carbs: number; fats: number };
}): Promise<NutritionRecommendation> {
  const prompt = `You are a nutrition coach. Return ONLY a valid JSON object, no other text or markdown.

User context:
- Goals: ${userData.goals}
- Dietary restrictions: ${userData.dietaryRestrictions?.join(", ") || "None"}
- Current daily intake: ${JSON.stringify(userData.currentIntake ?? "Not specified")}

Return exactly this JSON structure:
{
  "title": "nutrition plan title",
  "description": "brief description",
  "meals": [
    {
      "name": "meal name",
      "description": "short description",
      "protein": "grams",
      "carbs": "grams",
      "fats": "grams",
      "calories": "number as string"
    }
  ],
  "dailyTotals": {
    "protein": "total grams",
    "carbs": "total grams",
    "fats": "total grams",
    "calories": "total"
  }
}

Include 3-5 meals. Address goals and restrictions. Output only the JSON object.`;

  const raw = await generateJson<unknown>(prompt);
  return NutritionRecommendationSchema.parse(raw);
}

export async function getProgressAnalysis(userData: {
  startingStats: { weight?: number; bodyFat?: number; measurements?: Record<string, number> };
  currentStats: { weight?: number; bodyFat?: number; measurements?: Record<string, number> };
  goal: string;
  timeframe: string;
}): Promise<{ analysis: string; recommendations: string[] }> {
  const prompt = `You are a fitness analyst. Return ONLY a valid JSON object, no other text or markdown.

Context:
- Starting stats: ${JSON.stringify(userData.startingStats)}
- Current stats: ${JSON.stringify(userData.currentStats)}
- Goal: ${userData.goal}
- Timeframe: ${userData.timeframe}

Return exactly this JSON structure:
{
  "analysis": "brief analysis of progress",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Provide 3 concrete recommendations. Output only the JSON object.`;

  const raw = await generateJson<unknown>(prompt);
  return ProgressAnalysisSchema.parse(raw);
}
