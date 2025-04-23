import { User, InsertUser, WaterIntakeLog, InsertWaterIntakeLog, Measurement, InsertMeasurement, Exercise, WorkoutPlan, InsertWorkoutPlan, WorkoutPlanExercise, InsertWorkoutPlanExercise, Food, MealPlan, InsertMealPlan, Meal, InsertMeal, MealFood, InsertMealFood } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Water tracking
  getWaterIntakeLogs(userId: number, date?: Date): Promise<WaterIntakeLog[]>;
  addWaterIntake(log: InsertWaterIntakeLog): Promise<WaterIntakeLog>;
  
  // Measurements
  getMeasurements(userId: number): Promise<Measurement[]>;
  addMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
  
  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  searchExercises(query: string, muscleGroup?: string): Promise<Exercise[]>;
  
  // Workout plans
  getWorkoutPlans(userId: number): Promise<WorkoutPlan[]>;
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waterLogs: Map<number, WaterIntakeLog>;
  private measurements: Map<number, Measurement>;
  private exercises: Map<number, Exercise>;
  private workoutPlans: Map<number, WorkoutPlan>;
  private workoutExercises: Map<number, WorkoutPlanExercise>;
  private foods: Map<number, Food>;
  private mealPlans: Map<number, MealPlan>;
  private meals: Map<number, Meal>;
  private mealFoods: Map<number, MealFood>;
  
  sessionStore: session.SessionStore;
  
  private userId: number = 1;
  private waterLogId: number = 1;
  private measurementId: number = 1;
  private exerciseId: number = 1;
  private workoutPlanId: number = 1;
  private workoutExerciseId: number = 1;
  private foodId: number = 1;
  private mealPlanId: number = 1;
  private mealId: number = 1;
  private mealFoodId: number = 1;

  constructor() {
    this.users = new Map();
    this.waterLogs = new Map();
    this.measurements = new Map();
    this.exercises = new Map();
    this.workoutPlans = new Map();
    this.workoutExercises = new Map();
    this.foods = new Map();
    this.mealPlans = new Map();
    this.meals = new Map();
    this.mealFoods = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
    
    // Pre-populate with some sample exercises
    this.seedExercises();
    this.seedFoods();
  }

  // USER MANAGEMENT
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      ...userData,
      id,
      waterIntakeGoal: 3,
      calorieGoal: 2500,
      macros: {
        protein: 150,
        carbs: 270,
        fats: 60
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // WATER TRACKING
  async getWaterIntakeLogs(userId: number, date?: Date): Promise<WaterIntakeLog[]> {
    const logs = Array.from(this.waterLogs.values()).filter(log => log.userId === userId);
    
    if (date) {
      return logs.filter(log => this.isSameDay(log.date, date));
    }
    
    return logs;
  }

  async addWaterIntake(log: InsertWaterIntakeLog): Promise<WaterIntakeLog> {
    const id = this.waterLogId++;
    const waterLog: WaterIntakeLog = {
      ...log,
      id,
      date: new Date()
    };
    this.waterLogs.set(id, waterLog);
    return waterLog;
  }

  // MEASUREMENTS
  async getMeasurements(userId: number): Promise<Measurement[]> {
    return Array.from(this.measurements.values())
      .filter(measurement => measurement.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async addMeasurement(measurementData: InsertMeasurement): Promise<Measurement> {
    const id = this.measurementId++;
    const measurement: Measurement = {
      ...measurementData,
      id,
      date: new Date()
    };
    this.measurements.set(id, measurement);
    return measurement;
  }

  // EXERCISES
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async searchExercises(query: string, muscleGroup?: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise => {
      const nameMatch = exercise.name.toLowerCase().includes(query.toLowerCase());
      if (muscleGroup) {
        return nameMatch && exercise.muscleGroups.includes(muscleGroup);
      }
      return nameMatch;
    });
  }

  // WORKOUT PLANS
  async getWorkoutPlans(userId: number): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values())
      .filter(plan => plan.userId === userId);
  }

  async getWorkoutPlanById(id: number): Promise<WorkoutPlan | undefined> {
    return this.workoutPlans.get(id);
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = this.workoutPlanId++;
    const workoutPlan: WorkoutPlan = {
      ...plan,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.workoutPlans.set(id, workoutPlan);
    return workoutPlan;
  }

  async addExerciseToWorkoutPlan(workoutExercise: InsertWorkoutPlanExercise): Promise<WorkoutPlanExercise> {
    const id = this.workoutExerciseId++;
    const exercise: WorkoutPlanExercise = {
      ...workoutExercise,
      id
    };
    this.workoutExercises.set(id, exercise);
    return exercise;
  }

  async getWorkoutPlanExercises(workoutPlanId: number): Promise<(WorkoutPlanExercise & { exercise: Exercise })[]> {
    const exercises = Array.from(this.workoutExercises.values())
      .filter(ex => ex.workoutPlanId === workoutPlanId)
      .sort((a, b) => a.order - b.order);
    
    return exercises.map(ex => {
      const exercise = this.exercises.get(ex.exerciseId);
      return {
        ...ex,
        exercise: exercise!
      };
    });
  }

  // FOOD AND NUTRITION
  async getFoods(category?: string): Promise<Food[]> {
    if (category) {
      return Array.from(this.foods.values())
        .filter(food => food.category === category);
    }
    return Array.from(this.foods.values());
  }

  async getFoodById(id: number): Promise<Food | undefined> {
    return this.foods.get(id);
  }

  async searchFoods(query: string): Promise<Food[]> {
    return Array.from(this.foods.values())
      .filter(food => food.name.toLowerCase().includes(query.toLowerCase()));
  }

  // MEAL PLANS
  async getMealPlans(userId: number): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values())
      .filter(plan => plan.userId === userId);
  }

  async getMealPlanById(id: number): Promise<MealPlan | undefined> {
    return this.mealPlans.get(id);
  }

  async createMealPlan(plan: InsertMealPlan): Promise<MealPlan> {
    const id = this.mealPlanId++;
    const mealPlan: MealPlan = {
      ...plan,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mealPlans.set(id, mealPlan);
    return mealPlan;
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.mealId++;
    const newMeal: Meal = {
      ...meal,
      id
    };
    this.meals.set(id, newMeal);
    return newMeal;
  }

  async addFoodToMeal(mealFood: InsertMealFood): Promise<MealFood> {
    const id = this.mealFoodId++;
    const newMealFood: MealFood = {
      ...mealFood,
      id
    };
    this.mealFoods.set(id, newMealFood);
    return newMealFood;
  }

  async getMealsForPlan(mealPlanId: number): Promise<Meal[]> {
    return Array.from(this.meals.values())
      .filter(meal => meal.mealPlanId === mealPlanId);
  }

  async getMealFoods(mealId: number): Promise<(MealFood & { food: Food })[]> {
    const mealFoods = Array.from(this.mealFoods.values())
      .filter(mf => mf.mealId === mealId);
    
    return mealFoods.map(mf => {
      const food = this.foods.get(mf.foodId);
      return {
        ...mf,
        food: food!
      };
    });
  }

  // HELPER METHODS
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // SEED DATA
  private seedExercises() {
    const exercises: Exercise[] = [
      {
        id: this.exerciseId++,
        name: "Bench Press",
        description: "A compound chest exercise performed on a flat bench",
        muscleGroups: ["chest", "triceps", "shoulders"],
        equipment: ["barbell", "bench"],
        difficulty: "intermediate",
        instructions: [
          "Lie on a flat bench with feet flat on the floor",
          "Grip the barbell slightly wider than shoulder width",
          "Lower the bar to your mid-chest",
          "Press the bar back up to the starting position"
        ],
        videoUrl: "https://www.example.com/bench-press",
        imageUrl: "https://www.example.com/bench-press.jpg"
      },
      {
        id: this.exerciseId++,
        name: "Shoulder Press",
        description: "A compound shoulder exercise that targets deltoids",
        muscleGroups: ["shoulders", "triceps"],
        equipment: ["dumbbells", "barbell"],
        difficulty: "intermediate",
        instructions: [
          "Sit on a bench with back support",
          "Hold dumbbells at shoulder height with palms facing forward",
          "Press the weights up until your arms are fully extended",
          "Lower the weights back to the starting position"
        ],
        videoUrl: "https://www.example.com/shoulder-press",
        imageUrl: "https://www.example.com/shoulder-press.jpg"
      },
      {
        id: this.exerciseId++,
        name: "Tricep Extensions",
        description: "An isolation exercise that targets the triceps",
        muscleGroups: ["triceps"],
        equipment: ["dumbbell", "cable"],
        difficulty: "beginner",
        instructions: [
          "Hold a dumbbell with both hands above your head",
          "Lower the weight behind your head by bending at the elbows",
          "Extend your arms to raise the weight back to starting position",
          "Keep your upper arms stationary throughout the movement"
        ],
        videoUrl: "https://www.example.com/tricep-extensions",
        imageUrl: "https://www.example.com/tricep-extensions.jpg"
      },
      {
        id: this.exerciseId++,
        name: "Squats",
        description: "A compound lower body exercise",
        muscleGroups: ["quadriceps", "hamstrings", "glutes"],
        equipment: ["barbell", "bodyweight"],
        difficulty: "intermediate",
        instructions: [
          "Stand with feet shoulder-width apart",
          "Lower your body by bending your knees and hips",
          "Keep your back straight and chest up",
          "Return to standing position"
        ],
        videoUrl: "https://www.example.com/squats",
        imageUrl: "https://www.example.com/squats.jpg"
      },
      {
        id: this.exerciseId++,
        name: "Deadlift",
        description: "A compound full-body exercise",
        muscleGroups: ["back", "glutes", "hamstrings"],
        equipment: ["barbell"],
        difficulty: "advanced",
        instructions: [
          "Stand with feet hip-width apart, barbell over mid-foot",
          "Bend at hips and knees to grasp the bar",
          "Lift the bar by extending hips and knees",
          "Lower the bar by hinging at the hips and bending the knees"
        ],
        videoUrl: "https://www.example.com/deadlift",
        imageUrl: "https://www.example.com/deadlift.jpg"
      }
    ];
    
    exercises.forEach(exercise => {
      this.exercises.set(exercise.id, exercise);
    });
  }

  private seedFoods() {
    const foods: Food[] = [
      {
        id: this.foodId++,
        name: "Chicken Breast",
        calories: 165,
        servingSize: 100,
        servingUnit: "g",
        protein: 31,
        carbs: 0,
        fats: 3.6,
        category: "protein"
      },
      {
        id: this.foodId++,
        name: "Brown Rice",
        calories: 112,
        servingSize: 100,
        servingUnit: "g",
        protein: 2.6,
        carbs: 23,
        fats: 0.9,
        category: "carbs"
      },
      {
        id: this.foodId++,
        name: "Avocado",
        calories: 160,
        servingSize: 100,
        servingUnit: "g",
        protein: 2,
        carbs: 8.5,
        fats: 14.7,
        category: "fats"
      },
      {
        id: this.foodId++,
        name: "Oatmeal",
        calories: 68,
        servingSize: 100,
        servingUnit: "g",
        protein: 2.4,
        carbs: 12,
        fats: 1.4,
        category: "carbs"
      },
      {
        id: this.foodId++,
        name: "Whey Protein",
        calories: 113,
        servingSize: 30,
        servingUnit: "g",
        protein: 24,
        carbs: 1.5,
        fats: 1.8,
        category: "protein"
      },
      {
        id: this.foodId++,
        name: "Broccoli",
        calories: 34,
        servingSize: 100,
        servingUnit: "g",
        protein: 2.8,
        carbs: 6.6,
        fats: 0.4,
        category: "vegetables"
      },
      {
        id: this.foodId++,
        name: "Salmon",
        calories: 208,
        servingSize: 100,
        servingUnit: "g",
        protein: 20,
        carbs: 0,
        fats: 13,
        category: "protein"
      },
      {
        id: this.foodId++,
        name: "Sweet Potato",
        calories: 86,
        servingSize: 100,
        servingUnit: "g",
        protein: 1.6,
        carbs: 20.1,
        fats: 0.1,
        category: "carbs"
      }
    ];
    
    foods.forEach(food => {
      this.foods.set(food.id, food);
    });
  }
}

export const storage = new MemStorage();
