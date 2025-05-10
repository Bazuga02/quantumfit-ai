import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

const initialFoods = [
  {
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
    name: "Sweet Potato",
    calories: 86,
    servingSize: 100,
    servingUnit: "g",
    protein: 1.6,
    carbs: 20.1,
    fats: 0.1,
    category: "carbs"
  },
  {
    name: "Greek Yogurt",
    calories: 59,
    servingSize: 100,
    servingUnit: "g",
    protein: 10,
    carbs: 3.6,
    fats: 0.4,
    category: "protein"
  },
  {
    name: "Almonds",
    calories: 579,
    servingSize: 100,
    servingUnit: "g",
    protein: 21.2,
    carbs: 21.7,
    fats: 49.9,
    category: "fats"
  },
  {
    name: "Quinoa",
    calories: 120,
    servingSize: 100,
    servingUnit: "g",
    protein: 4.4,
    carbs: 21.3,
    fats: 1.9,
    category: "carbs"
  },
  {
    name: "Spinach",
    calories: 23,
    servingSize: 100,
    servingUnit: "g",
    protein: 2.9,
    carbs: 3.6,
    fats: 0.4,
    category: "vegetables"
  },
  // New foods
  {
    name: "Eggs",
    calories: 143,
    servingSize: 100,
    servingUnit: "g",
    protein: 13,
    carbs: 0.6,
    fats: 9.5,
    category: "protein"
  },
  {
    name: "Tuna",
    calories: 132,
    servingSize: 100,
    servingUnit: "g",
    protein: 29,
    carbs: 0,
    fats: 1.2,
    category: "protein"
  },
  {
    name: "Lentils",
    calories: 116,
    servingSize: 100,
    servingUnit: "g",
    protein: 9,
    carbs: 20,
    fats: 0.4,
    category: "protein"
  },
  {
    name: "Blueberries",
    calories: 57,
    servingSize: 100,
    servingUnit: "g",
    protein: 0.7,
    carbs: 14.5,
    fats: 0.3,
    category: "fruits"
  },
  {
    name: "Walnuts",
    calories: 654,
    servingSize: 100,
    servingUnit: "g",
    protein: 15.2,
    carbs: 13.7,
    fats: 65.2,
    category: "fats"
  },
  {
    name: "Kale",
    calories: 35,
    servingSize: 100,
    servingUnit: "g",
    protein: 2.9,
    carbs: 4.4,
    fats: 0.6,
    category: "vegetables"
  },
  {
    name: "Chia Seeds",
    calories: 486,
    servingSize: 100,
    servingUnit: "g",
    protein: 16.5,
    carbs: 42.1,
    fats: 30.7,
    category: "fats"
  },
  {
    name: "Turkey Breast",
    calories: 135,
    servingSize: 100,
    servingUnit: "g",
    protein: 29,
    carbs: 0,
    fats: 1.7,
    category: "protein"
  },
  {
    name: "Cottage Cheese",
    calories: 98,
    servingSize: 100,
    servingUnit: "g",
    protein: 11,
    carbs: 3.4,
    fats: 4.3,
    category: "protein"
  },
  {
    name: "Brussels Sprouts",
    calories: 43,
    servingSize: 100,
    servingUnit: "g",
    protein: 3.4,
    carbs: 8.8,
    fats: 0.3,
    category: "vegetables"
  },
  {
    name: "Pumpkin Seeds",
    calories: 559,
    servingSize: 100,
    servingUnit: "g",
    protein: 30.2,
    carbs: 10.7,
    fats: 49.1,
    category: "fats"
  },
  {
    name: "Black Beans",
    calories: 132,
    servingSize: 100,
    servingUnit: "g",
    protein: 8.9,
    carbs: 23.7,
    fats: 0.5,
    category: "protein"
  },
  {
    name: "Banana",
    calories: 89,
    servingSize: 100,
    servingUnit: "g",
    protein: 1.1,
    carbs: 22.8,
    fats: 0.3,
    category: "fruits"
  }
];

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

const main = async () => {
  try {
    console.log('Checking for existing foods...');
    const existingFoods = await db.select().from(schema.foods);
    
    if (existingFoods.length === 0) {
      console.log('Seeding initial foods...');
      for (const food of initialFoods) {
        await db.insert(schema.foods).values(food);
      }
      console.log('Initial foods seeded successfully!');
    } else {
      console.log('Foods already exist, skipping seed data.');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

main(); 