import { Router } from "express";
import { storage as dbStorage } from "../storage.js";

export const nutritionSummaryRouter = Router();

nutritionSummaryRouter.get("/nutrition-summary", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const meals = await dbStorage.getMealsForUserOnDate(userId, todayStr);
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    const mealSummaries: { type: string; name: string; calories: number }[] = [];

    for (const meal of meals) {
      const mealFoods = await dbStorage.getMealFoods(meal.id);
      let mealCalories = 0;
      let mealProtein = 0;
      let mealCarbs = 0;
      let mealFats = 0;
      for (const mf of mealFoods) {
        mealCalories += mf.food.calories * mf.servings;
        mealProtein += mf.food.protein * mf.servings;
        mealCarbs += mf.food.carbs * mf.servings;
        mealFats += mf.food.fats * mf.servings;
      }
      totalCalories += mealCalories;
      totalProtein += mealProtein;
      totalCarbs += mealCarbs;
      totalFats += mealFats;
      mealSummaries.push({
        type: meal.name,
        name: mealFoods.map((mf) => mf.food.name).join(", "),
        calories: Math.round(mealCalories),
      });
    }

    const user = await dbStorage.getUser(userId);
    const calorieGoal = user?.calorieGoal || 2700;
    const macros = user?.macros || { protein: 150, carbs: 270, fats: 60 };

    res.json({
      calories: {
        consumed: Math.round(totalCalories),
        goal: calorieGoal,
        remaining: Math.max(0, calorieGoal - Math.round(totalCalories)),
      },
      macros: {
        protein: { consumed: Math.round(totalProtein), goal: macros.protein },
        carbs: { consumed: Math.round(totalCarbs), goal: macros.carbs },
        fats: { consumed: Math.round(totalFats), goal: macros.fats },
      },
      meals: mealSummaries,
    });
  } catch (error) {
    console.error("[nutrition-summary] Error:", error);
    res.status(500).json({ message: "Failed to fetch nutrition summary" });
  }
});
