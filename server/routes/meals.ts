import { Router } from "express";
import { z } from "zod";
import {
  insertMealPlanSchema,
  insertMealSchema,
  insertMealFoodSchema,
} from "../../shared/schema.js";
import { storage as dbStorage } from "../storage.js";

export const mealsRouter = Router();

mealsRouter.get("/meal-plans", async (req, res) => {
  try {
    const plans = await dbStorage.getMealPlans(req.user!.id);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch meal plans" });
  }
});

mealsRouter.get("/meal-plans/:id", async (req, res) => {
  try {
    const plan = await dbStorage.getMealPlanById(parseInt(req.params.id, 10));

    if (!plan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    if (plan.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to this meal plan" });
    }

    const meals = await dbStorage.getMealsForPlan(plan.id);
    const mealsWithFoods = await Promise.all(
      meals.map(async (meal) => {
        const foods = await dbStorage.getMealFoods(meal.id);
        return {
          ...meal,
          foods,
        };
      })
    );

    res.json({
      ...plan,
      meals: mealsWithFoods,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch meal plan" });
  }
});

mealsRouter.post("/meal-plans", async (req, res) => {
  try {
    const data = insertMealPlanSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    const plan = await dbStorage.createMealPlan(data);
    res.status(201).json(plan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create meal plan" });
  }
});

mealsRouter.post("/meal-plans/:id/meals", async (req, res) => {
  try {
    const planId = parseInt(req.params.id, 10);
    const plan = await dbStorage.getMealPlanById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    if (plan.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to this meal plan" });
    }

    const data = insertMealSchema.parse({
      ...req.body,
      mealPlanId: planId,
    });

    const meal = await dbStorage.createMeal(data);
    res.status(201).json(meal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to add meal to meal plan" });
  }
});

mealsRouter.post("/meals/:id/foods", async (req, res) => {
  try {
    const data = insertMealFoodSchema.parse({
      ...req.body,
      mealId: parseInt(req.params.id, 10),
    });

    const mealFood = await dbStorage.addFoodToMeal(data);
    res.status(201).json(mealFood);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to add food to meal" });
  }
});

mealsRouter.post("/meals", async (req, res) => {
  try {
    const { name, time, date, foods } = req.body;

    const mealData = insertMealSchema.parse({
      name,
      time,
      date: date || new Date().toISOString().split("T")[0],
      userId: req.user!.id,
    });

    const meal = await dbStorage.createMeal(mealData);

    if (Array.isArray(foods) && foods.length > 0) {
      for (const food of foods) {
        const foodData = insertMealFoodSchema.parse({
          foodId: food.foodId,
          servings: food.servings,
          mealId: meal.id,
        });

        await dbStorage.addFoodToMeal(foodData);
      }
    }

    res.status(200).json({ message: "Meal logged successfully", meal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    console.error("Error logging meal:", error);
    res.status(500).json({ message: "Failed to log meal" });
  }
});
