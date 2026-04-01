import { Router } from "express";
import { storage as dbStorage } from "../storage.js";

export const foodsRouter = Router();

foodsRouter.get("/foods/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }
    const foods = await dbStorage.searchFoods(query);
    res.json(foods);
  } catch (error) {
    console.error("Error searching foods:", error);
    res.status(500).json({ error: "Failed to search foods" });
  }
});

foodsRouter.get("/foods/:id", async (req, res) => {
  try {
    const food = await dbStorage.getFoodById(parseInt(req.params.id, 10));

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch food" });
  }
});

/** Supports `search`, `category`, or list all (single registration; avoids duplicate `/foods` handlers). */
foodsRouter.get("/foods", async (req, res) => {
  try {
    const search = req.query.search;
    const category = req.query.category;

    let foods;
    if (typeof search === "string" && search.length > 0) {
      foods = await dbStorage.searchFoods(search);
    } else if (typeof category === "string" && category.length > 0) {
      foods = await dbStorage.getFoods(category);
    } else {
      foods = await dbStorage.getFoods();
    }

    res.json(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ error: "Failed to fetch foods" });
  }
});
