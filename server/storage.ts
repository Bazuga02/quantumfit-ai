import { User, InsertUser, Measurement, InsertMeasurement, Exercise, WorkoutPlan, InsertWorkoutPlan, WorkoutPlanExercise, InsertWorkoutPlanExercise, Food, MealPlan, InsertMealPlan, Meal, InsertMeal, MealFood, InsertMealFood, WaterIntake, InsertWaterIntake } from "@shared/schema";
import createMemoryStore from "memorystore";
import session, { Store } from "express-session";
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and, desc, gte, lt } from 'drizzle-orm';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from 'drizzle-orm';

// Add retry utility function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Check if it's a rate limit error
      if (error?.message?.includes('rate limit')) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      // If it's not a rate limit error, throw immediately
      throw error;
    }
  }
  
  throw lastError;
}

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Measurements
  getMeasurements(userId: number): Promise<Measurement[]>;
  addMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
  
  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  searchExercises(query: string, muscleGroup?: string): Promise<Exercise[]>;
  
  // Workout plans
  getWorkoutPlans(filter?: { userId?: number; isTemplate?: boolean }): Promise<WorkoutPlan[]>;
  getWorkoutPlanById(id: number): Promise<WorkoutPlan | undefined>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  addExerciseToWorkoutPlan(workoutExercise: InsertWorkoutPlanExercise): Promise<WorkoutPlanExercise>;
  getWorkoutPlanExercises(workoutPlanId: number): Promise<(WorkoutPlanExercise & { exercise: Exercise })[]>;
  
  // Food and nutrition
  getFoods(category?: string): Promise<Food[]>;
  getFoodById(id: number): Promise<Food | undefined>;
  searchFoods(query: string): Promise<Food[]>;
  
  // Meal plans
  getMealPlans(userId: number): Promise<MealPlan[]>;
  getMealPlanById(id: number): Promise<MealPlan | undefined>;
  createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  addFoodToMeal(mealFood: InsertMealFood): Promise<MealFood>;
  getMealsForPlan(mealPlanId: number): Promise<Meal[]>;
  getMealFoods(mealId: number): Promise<(MealFood & { food: Food })[]>;
  
  // Session store for authentication
  sessionStore: Store;

  getAllUsers(): Promise<User[]>;

  // Water intake methods
  getWaterIntakes(userId: number, date?: Date): Promise<WaterIntake[]>;
  addWaterIntake(intake: InsertWaterIntake): Promise<WaterIntake>;
  getTotalWaterIntake(userId: number, date?: Date): Promise<number>;

  // Progress photos
  getProgressPhotos(userId: number): Promise<schema.ProgressPhoto[]>;
  addProgressPhoto(photo: schema.InsertProgressPhoto): Promise<schema.ProgressPhoto>;

  // Trained body parts
  getTrainedBodyParts(userId: number, date?: Date): Promise<schema.TrainedBodyPart[]>;
  addTrainedBodyPart(entry: schema.InsertTrainedBodyPart): Promise<schema.TrainedBodyPart>;

  getMealsForUserOnDate(userId: number, date: string): Promise<Meal[]>;

  getTrainedBodyPartsInRange(userId: number, fromDate: Date, toDate: Date): Promise<schema.TrainedBodyPart[]>;
}

export class PostgresStorage implements IStorage {
  public sessionStore: Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, id));
      return result[0];
    } catch (error) {
      console.error('Error in getUser:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await withRetry(async () => {
        const result = await db.select()
          .from(schema.users)
          .where(eq(schema.users.email, email));
        return result[0];
      });
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      return await withRetry(async () => {
        const result = await db.insert(schema.users)
          .values({
            ...user,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        if (!result || result.length === 0) {
          throw new Error('Failed to create user');
        }
        
        return result[0];
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  async getMeasurements(userId: number): Promise<Measurement[]> {
    return db.select()
      .from(schema.measurements)
      .where(eq(schema.measurements.userId, userId))
      .orderBy(schema.measurements.date);
  }

  async addMeasurement(measurement: InsertMeasurement): Promise<Measurement> {
    const [newMeasurement] = await db.insert(schema.measurements).values(measurement).returning();
    return newMeasurement;
  }

  async getExercises(): Promise<Exercise[]> {
    return db.select().from(schema.exercises);
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    const exercises = await db.select().from(schema.exercises).where(eq(schema.exercises.id, id));
    return exercises[0];
  }

  async searchExercises(query: string, muscleGroup?: string): Promise<Exercise[]> {
    const exercises = await db.select().from(schema.exercises);
    return exercises.filter(exercise => {
      const nameMatch = exercise.name.toLowerCase().includes(query.toLowerCase());
      if (muscleGroup) {
        return nameMatch && exercise.muscleGroups.includes(muscleGroup);
      }
      return nameMatch;
    });
  }

  async getWorkoutPlans(filter?: { userId?: number; isTemplate?: boolean }): Promise<WorkoutPlan[]> {
    const baseQuery = db.select().from(schema.workoutPlans);
    
    if (filter?.userId !== undefined) {
      return baseQuery.where(eq(schema.workoutPlans.userId, filter.userId));
    }
    
    if (filter?.isTemplate !== undefined) {
      return baseQuery.where(eq(schema.workoutPlans.isTemplate, filter.isTemplate));
    }
    
    return baseQuery;
  }

  async getWorkoutPlanById(id: number): Promise<WorkoutPlan | undefined> {
    const plans = await db.select()
      .from(schema.workoutPlans)
      .where(eq(schema.workoutPlans.id, id));
    return plans[0];
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [newPlan] = await db.insert(schema.workoutPlans).values(plan).returning();
    return newPlan;
  }

  async addExerciseToWorkoutPlan(workoutExercise: InsertWorkoutPlanExercise): Promise<WorkoutPlanExercise> {
    const [newWorkoutExercise] = await db.insert(schema.workoutPlanExercises)
      .values(workoutExercise)
      .returning();
    return newWorkoutExercise;
  }

  async getWorkoutPlanExercises(workoutPlanId: number): Promise<(WorkoutPlanExercise & { exercise: Exercise })[]> {
    const exercises = await db.select()
      .from(schema.workoutPlanExercises)
      .where(eq(schema.workoutPlanExercises.workoutPlanId, workoutPlanId));
    
    // Fetch exercise details for each workout exercise
    const exerciseDetails = await Promise.all(
      exercises.map(async (we) => {
        const exercise = await this.getExerciseById(we.exerciseId);
        return { ...we, exercise: exercise! };
      })
    );
    
    return exerciseDetails;
  }

  async getFoods(category?: string): Promise<Food[]> {
    const query = db.select().from(schema.foods);
    if (category) {
      return query.where(eq(schema.foods.category, category));
    }
    return query;
  }

  async getFoodById(id: number): Promise<Food | undefined> {
    const foods = await db.select().from(schema.foods).where(eq(schema.foods.id, id));
    return foods[0];
  }

  async searchFoods(query: string): Promise<Food[]> {
    const foods = await db.select().from(schema.foods);
    return foods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getMealPlans(userId: number): Promise<MealPlan[]> {
    return db.select()
      .from(schema.mealPlans)
      .where(eq(schema.mealPlans.userId, userId));
  }

  async getMealPlanById(id: number): Promise<MealPlan | undefined> {
    const plans = await db.select()
      .from(schema.mealPlans)
      .where(eq(schema.mealPlans.id, id));
    return plans[0];
  }

  async createMealPlan(plan: InsertMealPlan): Promise<MealPlan> {
    const [newPlan] = await db.insert(schema.mealPlans).values(plan).returning();
    return newPlan;
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(schema.meals).values(meal).returning();
    return newMeal;
  }

  async addFoodToMeal(mealFood: InsertMealFood): Promise<MealFood> {
    const [newMealFood] = await db.insert(schema.mealFoods).values(mealFood).returning();
    return newMealFood;
  }

  async getMealsForPlan(mealPlanId: number): Promise<Meal[]> {
    return db.select()
      .from(schema.meals)
      .where(eq(schema.meals.mealPlanId, mealPlanId));
  }

  async getMealFoods(mealId: number): Promise<(MealFood & { food: Food })[]> {
    const mealFoods = await db.select()
      .from(schema.mealFoods)
      .where(eq(schema.mealFoods.mealId, mealId));
    
    // Fetch food details for each meal food
    const foodDetails = await Promise.all(
      mealFoods.map(async (mf) => {
        const food = await this.getFoodById(mf.foodId);
        return { ...mf, food: food! };
      })
    );
    
    return foodDetails;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await db.select()
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));
    return users;
  }

  async getWaterIntakes(userId: number, date?: Date): Promise<WaterIntake[]> {
    const baseWhereClause = eq(schema.waterIntakes.userId, userId);
    
    if (!date) {
      return db.select().from(schema.waterIntakes).where(baseWhereClause);
    }
    
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    
    return db.select().from(schema.waterIntakes).where(
      and(
        baseWhereClause,
        gte(schema.waterIntakes.date, start),
        lt(schema.waterIntakes.date, end)
      )
    );
  }

  async addWaterIntake(intake: InsertWaterIntake): Promise<WaterIntake> {
    const [newIntake] = await db.insert(schema.waterIntakes).values(intake).returning();
    return newIntake;
  }

  async getTotalWaterIntake(userId: number, date?: Date): Promise<number> {
    const baseWhereClause = eq(schema.waterIntakes.userId, userId);
    
    if (!date) {
      const result = await db
        .select({ total: sql<number>`sum(${schema.waterIntakes.amount})`.as('total') })
        .from(schema.waterIntakes)
        .where(baseWhereClause);
      return result[0]?.total || 0;
    }
    
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    
    const result = await db
      .select({ total: sql<number>`sum(${schema.waterIntakes.amount})`.as('total') })
      .from(schema.waterIntakes)
      .where(
        and(
          baseWhereClause,
          gte(schema.waterIntakes.date, start),
          lt(schema.waterIntakes.date, end)
        )
      );
    return result[0]?.total || 0;
  }

  async getProgressPhotos(userId: number): Promise<schema.ProgressPhoto[]> {
    return db.select()
      .from(schema.progressPhotos)
      .where(eq(schema.progressPhotos.userId, userId))
      .orderBy(desc(schema.progressPhotos.date));
  }

  async addProgressPhoto(photo: schema.InsertProgressPhoto): Promise<schema.ProgressPhoto> {
    const [newPhoto] = await db.insert(schema.progressPhotos).values(photo).returning();
    return newPhoto;
  }

  async getTrainedBodyParts(userId: number, date?: Date): Promise<schema.TrainedBodyPart[]> {
    const baseWhereClause = eq(schema.trainedBodyParts.userId, userId);
    
    if (!date) {
      return db.select().from(schema.trainedBodyParts).where(baseWhereClause);
    }
    
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    
    return db.select().from(schema.trainedBodyParts).where(
      and(
        baseWhereClause,
        gte(schema.trainedBodyParts.date, start),
        lt(schema.trainedBodyParts.date, end)
      )
    );
  }

  async addTrainedBodyPart(entry: schema.InsertTrainedBodyPart): Promise<schema.TrainedBodyPart> {
    const [newEntry] = await db.insert(schema.trainedBodyParts).values(entry).returning();
    return newEntry;
  }

  async getMealsForUserOnDate(userId: number, date: string): Promise<Meal[]> {
    return db.select()
      .from(schema.meals)
      .where(
        and(
          eq(schema.meals.userId, userId),
          eq(schema.meals.date, date)
        )
      );
  }

  async getTrainedBodyPartsInRange(userId: number, fromDate: Date, toDate: Date) {
    return db.select().from(schema.trainedBodyParts).where(
      and(
        eq(schema.trainedBodyParts.userId, userId),
        gte(schema.trainedBodyParts.date, fromDate),
        lt(schema.trainedBodyParts.date, new Date(toDate.getTime() + 24 * 60 * 60 * 1000))
      )
    );
  }
}

export const storage = new PostgresStorage();
