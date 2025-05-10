-- Insert new upper body workout plans
INSERT INTO workout_plans (user_id, name, description, duration, difficulty, schedule)
VALUES 
  (1, 'Push Day Power', 'Focus on chest, shoulders, and triceps with compound movements', 60, 'intermediate', ARRAY['Monday', 'Thursday']),
  (1, 'Pull Day Strength', 'Target back and biceps with heavy compound lifts', 60, 'intermediate', ARRAY['Tuesday', 'Friday']),
  (1, 'Upper Body Hypertrophy', 'High volume workout for muscle growth', 75, 'advanced', ARRAY['Monday', 'Wednesday', 'Friday']),
  (1, 'Upper Body Endurance', 'Circuit training for muscular endurance', 45, 'beginner', ARRAY['Tuesday', 'Thursday']),
  (1, 'Upper Body Power', 'Explosive movements for power development', 50, 'advanced', ARRAY['Monday', 'Thursday']),
  (1, 'Upper Body Mobility', 'Focus on flexibility and mobility with strength', 40, 'beginner', ARRAY['Wednesday', 'Saturday']),
  (1, 'Upper Body Circuit', 'High-intensity circuit training', 30, 'intermediate', ARRAY['Tuesday', 'Friday']);

-- Insert exercises for Push Day Power
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Push Day Power'),
  id,
  4,
  8,
  0,
  90,
  1
FROM exercises WHERE name = 'Bench Press';

INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Push Day Power'),
  id,
  3,
  10,
  0,
  60,
  2
FROM exercises WHERE name = 'Overhead Press';

-- Insert exercises for Pull Day Strength
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Pull Day Strength'),
  id,
  4,
  6,
  0,
  120,
  1
FROM exercises WHERE name = 'Deadlift';

INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Pull Day Strength'),
  id,
  3,
  10,
  0,
  90,
  2
FROM exercises WHERE name = 'Pull-ups';

-- Insert exercises for Upper Body Hypertrophy
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Hypertrophy'),
  id,
  4,
  12,
  0,
  60,
  1
FROM exercises WHERE name = 'Incline Dumbbell Press';

INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Hypertrophy'),
  id,
  3,
  15,
  0,
  45,
  2
FROM exercises WHERE name = 'Lateral Raises';

-- Insert exercises for Upper Body Endurance
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Endurance'),
  id,
  3,
  20,
  0,
  30,
  1
FROM exercises WHERE name = 'Push-ups';

INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Endurance'),
  id,
  3,
  15,
  0,
  30,
  2
FROM exercises WHERE name = 'Bodyweight Rows';

-- Insert exercises for Upper Body Power
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Power'),
  id,
  5,
  3,
  0,
  180,
  1
FROM exercises WHERE name = 'Power Clean';

INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Power'),
  id,
  4,
  5,
  0,
  120,
  2
FROM exercises WHERE name = 'Push Press';

-- Insert exercises for Upper Body Mobility
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Mobility'),
  id,
  3,
  12,
  0,
  45,
  1
FROM exercises WHERE name = 'Band Pull-aparts';

INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Mobility'),
  id,
  3,
  10,
  0,
  45,
  2
FROM exercises WHERE name = 'Face Pulls';

-- Insert exercises for Upper Body Circuit
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Circuit'),
  id,
  3,
  15,
  0,
  30,
  1
FROM exercises WHERE name = 'Kettlebell Swings';

INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, "order")
SELECT 
  (SELECT id FROM workout_plans WHERE name = 'Upper Body Circuit'),
  id,
  3,
  12,
  0,
  30,
  2
FROM exercises WHERE name = 'Medicine Ball Slams'; 