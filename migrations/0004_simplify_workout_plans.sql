-- Add is_template column to workout_plans
ALTER TABLE workout_plans ADD COLUMN is_template boolean DEFAULT false;

-- Drop template and user workout plan tables
DROP TABLE IF EXISTS template_workout_plan_exercises;
DROP TABLE IF EXISTS template_workout_plans;
DROP TABLE IF EXISTS user_workout_plans; 