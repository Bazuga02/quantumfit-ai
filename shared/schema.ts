import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  waterIntakeGoal: real("water_intake_goal").default(3),
  calorieGoal: integer("calorie_goal").default(2500),
  macros: jsonb("macros").$type<{
    protein: number;
    carbs: number;
    fats: number;
  }>().default({
    protein: 150,
    carbs: 270,
    fats: 60
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Water intake tracking
export const waterIntakeLogs = pgTable("water_intake_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  amount: real("amount").notNull(),
});

export const insertWaterIntakeLogSchema = createInsertSchema(waterIntakeLogs).pick({
  userId: true,
  amount: true,
});

// Body measurements
export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  weight: real("weight"),
  bodyFat: real("body_fat"),
  chest: real("chest"),
  waist: real("waist"),
  hips: real("hips"),
  arms: real("arms"),
  thighs: real("thighs"),
});

export const insertMeasurementSchema = createInsertSchema(measurements).omit({
  id: true, 
  date: true
});

// Exercise library
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  muscleGroups: text("muscle_groups").array().notNull(),
  equipment: text("equipment").array(),
  difficulty: text("difficulty").notNull(),
  instructions: text("instructions").array().notNull(),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true
});

// Workout plans
export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  schedule: text("schedule").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const workoutPlanExercises = pgTable("workout_plan_exercises", {
  id: serial("id").primaryKey(),
  workoutPlanId: integer("workout_plan_id").notNull().references(() => workoutPlans.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight"),
  duration: integer("duration"),
  order: integer("order").notNull(),
});

export const insertWorkoutPlanExerciseSchema = createInsertSchema(workoutPlanExercises).omit({
  id: true
});

// Food database
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  servingSize: real("serving_size").notNull(),
  servingUnit: text("serving_unit").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fats: real("fats").notNull(),
  category: text("category").notNull(),
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true
});

// Meal plans
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  totalCalories: integer("total_calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fats: real("fats").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  mealPlanId: integer("meal_plan_id").notNull().references(() => mealPlans.id),
  name: text("name").notNull(),
  time: text("time").notNull(),
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true
});

export const mealFoods = pgTable("meal_foods", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull().references(() => meals.id),
  foodId: integer("food_id").notNull().references(() => foods.id),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
});

export const insertMealFoodSchema = createInsertSchema(mealFoods).omit({
  id: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type WaterIntakeLog = typeof waterIntakeLogs.$inferSelect;
export type InsertWaterIntakeLog = z.infer<typeof insertWaterIntakeLogSchema>;

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;

export type WorkoutPlanExercise = typeof workoutPlanExercises.$inferSelect;
export type InsertWorkoutPlanExercise = z.infer<typeof insertWorkoutPlanExerciseSchema>;

export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;

export type MealFood = typeof mealFoods.$inferSelect;
export type InsertMealFood = z.infer<typeof insertMealFoodSchema>;
