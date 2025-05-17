import { IStorage } from './storage';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { eq, desc, and, gte, lt, lte } from 'drizzle-orm';
import createMemoryStore from "memorystore";
import session, { Store } from "express-session";
import { 
  User, 
  InsertUser, 
  Measurement, 
  InsertMeasurement, 
  Exercise, 
  WorkoutPlan, 
  InsertWorkoutPlan, 
  WorkoutPlanExercise, 
  InsertWorkoutPlanExercise, 
  Food, 
  MealPlan, 
  InsertMealPlan, 
  Meal, 
  InsertMeal, 
  MealFood, 
  InsertMealFood, 
  WaterIntake,
  InsertWaterIntake,
  waterIntakes,
  ProgressPhoto,
  progressPhotos,
  meals,
  TrainedBodyPart
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export class DbStorage implements IStorage {
  sessionStore: Store;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
  }

  // USER MANAGEMENT
  async getAllUsers(): Promise<schema.User[]> {
    return db.select().from(schema.users);
  }

  async getUser(id: number): Promise<schema.User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return users[0];
  }

  async createUser(userData: schema.InsertUser): Promise<schema.User> {
    const [user] = await db.insert(schema.users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<schema.User>): Promise<schema.User | undefined> {
    const [user] = await db.update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  // MEASUREMENTS
  async getMeasurements(userId: number): Promise<schema.Measurement[]> {
    return db.select()
      .from(schema.measurements)
      .where(eq(schema.measurements.userId, userId))
      .orderBy(schema.measurements.date);
  }

  async addMeasurement(measurement: schema.InsertMeasurement): Promise<schema.Measurement> {
    const [newMeasurement] = await db.insert(schema.measurements).values(measurement).returning();
    return newMeasurement;
  }

  // EXERCISES
  async getExercises(): Promise<schema.Exercise[]> {
    return db.select().from(schema.exercises);
  }

  async getExerciseById(id: number): Promise<schema.Exercise | undefined> {
    const exercises = await db.select().from(schema.exercises).where(eq(schema.exercises.id, id));
    return exercises[0];
  }

  async searchExercises(query: string, muscleGroup?: string): Promise<schema.Exercise[]> {
    let exercises = await db.select().from(schema.exercises);
    return exercises.filter(exercise => {
      const nameMatch = exercise.name.toLowerCase().includes(query.toLowerCase());
      if (muscleGroup) {
        const muscleGroups = Array.isArray(exercise.muscleGroups) 
          ? exercise.muscleGroups 
          : JSON.parse(exercise.muscleGroups as string);
        return nameMatch && muscleGroups.includes(muscleGroup);
      }
      return nameMatch;
    });
  }

  // WORKOUT PLANS
  async getWorkoutPlans(filter?: { userId?: number; isTemplate?: boolean }): Promise<schema.WorkoutPlan[]> {
    const query = db.select().from(schema.workoutPlans);
    
    if (filter?.userId !== undefined && filter?.isTemplate !== undefined) {
      return query.where(and(
        eq(schema.workoutPlans.userId, filter.userId),
        eq(schema.workoutPlans.isTemplate, filter.isTemplate)
      ));
    }
    
    if (filter?.userId !== undefined) {
      return query.where(eq(schema.workoutPlans.userId, filter.userId));
    }
    
    if (filter?.isTemplate !== undefined) {
      return query.where(eq(schema.workoutPlans.isTemplate, filter.isTemplate));
    }
    
    return query;
  }

  async getWorkoutPlanById(id: number): Promise<schema.WorkoutPlan | undefined> {
    const plans = await db.select()
      .from(schema.workoutPlans)
      .where(eq(schema.workoutPlans.id, id));
    return plans[0];
  }

  async createWorkoutPlan(plan: schema.InsertWorkoutPlan): Promise<schema.WorkoutPlan> {
    const [newPlan] = await db.insert(schema.workoutPlans).values(plan).returning();
    return newPlan;
  }

  async addExerciseToWorkoutPlan(workoutExercise: schema.InsertWorkoutPlanExercise): Promise<schema.WorkoutPlanExercise> {
    const [newWorkoutExercise] = await db.insert(schema.workoutPlanExercises)
      .values(workoutExercise)
      .returning();
    return newWorkoutExercise;
  }

  async getWorkoutPlanExercises(workoutPlanId: number): Promise<(schema.WorkoutPlanExercise & { exercise: schema.Exercise })[]> {
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

  // FOOD AND NUTRITION
  async getFoods(category?: string): Promise<schema.Food[]> {
    const query = db.select().from(schema.foods);
    if (category) {
      return query.where(eq(schema.foods.category, category));
    }
    return query;
  }

  async getFoodById(id: number): Promise<schema.Food | undefined> {
    const foods = await db.select().from(schema.foods).where(eq(schema.foods.id, id));
    return foods[0];
  }

  async searchFoods(query: string): Promise<schema.Food[]> {
    const foods = await db.select().from(schema.foods);
    return foods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // MEAL PLANS
  async getMealPlans(userId: number): Promise<schema.MealPlan[]> {
    return db.select()
      .from(schema.mealPlans)
      .where(eq(schema.mealPlans.userId, userId));
  }

  async getMealPlanById(id: number): Promise<schema.MealPlan | undefined> {
    const plans = await db.select()
      .from(schema.mealPlans)
      .where(eq(schema.mealPlans.id, id));
    return plans[0];
  }

  async createMealPlan(plan: schema.InsertMealPlan): Promise<schema.MealPlan> {
    const [newPlan] = await db.insert(schema.mealPlans).values(plan).returning();
    return newPlan;
  }

  async createMeal(meal: schema.InsertMeal): Promise<schema.Meal> {
    const [newMeal] = await db.insert(schema.meals).values(meal).returning();
    return newMeal;
  }

  async addFoodToMeal(mealFood: schema.InsertMealFood): Promise<schema.MealFood> {
    const [newMealFood] = await db.insert(schema.mealFoods).values(mealFood).returning();
    return newMealFood;
  }

  async getMealsForPlan(mealPlanId: number): Promise<schema.Meal[]> {
    return db.select()
      .from(schema.meals)
      .where(eq(schema.meals.mealPlanId, mealPlanId));
  }

  async getMealFoods(mealId: number): Promise<(schema.MealFood & { food: schema.Food })[]> {
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

  // Water intake tracking
  async getWaterIntakes(userId: number, date?: Date): Promise<WaterIntake[]> {
    try {
      const query = db.select().from(waterIntakes);
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return await query.where(and(
          eq(waterIntakes.userId, userId),
          gte(waterIntakes.date, startOfDay),
          lt(waterIntakes.date, endOfDay)
        ));
      }
      
      return await query.where(eq(waterIntakes.userId, userId));
    } catch (error) {
      console.error('Error fetching water intakes:', error);
      throw new Error('Failed to fetch water intakes');
    }
  }

  async addWaterIntake(intake: InsertWaterIntake): Promise<WaterIntake> {
    try {
      const [newIntake] = await db.insert(waterIntakes)
        .values(intake)
        .returning();
      return newIntake;
    } catch (error) {
      console.error('Error adding water intake:', error);
      throw new Error('Failed to add water intake');
    }
  }

  async getTotalWaterIntake(userId: number, date?: Date): Promise<number> {
    try {
      const intakes = await this.getWaterIntakes(userId, date);
      return intakes.reduce((total, intake) => total + intake.amount, 0);
    } catch (error) {
      console.error('Error calculating total water intake:', error);
      throw new Error('Failed to calculate total water intake');
    }
  }

  async getTrainedBodyParts(userId: number, date?: Date): Promise<schema.TrainedBodyPart[]> {
    const baseWhere = eq(schema.trainedBodyParts.userId, userId);
    if (!date) {
      return db.select().from(schema.trainedBodyParts).where(baseWhere);
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return db.select().from(schema.trainedBodyParts).where(
      and(
        baseWhere,
        gte(schema.trainedBodyParts.date, start),
        lt(schema.trainedBodyParts.date, end)
      )
    );
  }

  async addTrainedBodyPart(entry: schema.InsertTrainedBodyPart): Promise<schema.TrainedBodyPart> {
    const [newEntry] = await db.insert(schema.trainedBodyParts).values(entry).returning();
    return newEntry;
  }

  async getProgressPhotos(userId: number): Promise<ProgressPhoto[]> {
    const photos = await db.select().from(progressPhotos).where(eq(progressPhotos.userId, userId));
    return photos;
  }

  async addProgressPhoto(photo: { url: string; userId: number; note?: string | null; bodyPart?: string | null; }): Promise<ProgressPhoto> {
    const [newPhoto] = await db.insert(progressPhotos).values({
      userId: photo.userId,
      url: photo.url,
      note: photo.note,
      bodyPart: photo.bodyPart,
      date: new Date()
    }).returning();
    return newPhoto;
  }

  async getMealsForUserOnDate(userId: number, date: string): Promise<Meal[]> {
    const mealsList = await db.select().from(meals).where(
      and(
        eq(meals.userId, userId),
        eq(meals.date, date)
      )
    );
    return mealsList;
  }

  async getTrainedBodyPartsInRange(userId: number, fromDate: Date, toDate: Date): Promise<TrainedBodyPart[]> {
    return db.select().from(schema.trainedBodyParts).where(
      and(
        eq(schema.trainedBodyParts.userId, userId),
        gte(schema.trainedBodyParts.date, fromDate),
        lte(schema.trainedBodyParts.date, toDate)
      )
    );
  }
} 
