-- Create new tables
CREATE TABLE template_workout_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_workout_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_plan_id INTEGER REFERENCES template_workout_plans(id) ON DELETE CASCADE,
    schedule TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE template_workout_plan_exercises (
    id SERIAL PRIMARY KEY,
    template_plan_id INTEGER REFERENCES template_workout_plans(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight REAL,
    duration INTEGER,
    rest_time INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing workout plans to templates
INSERT INTO template_workout_plans (name, description, duration, difficulty)
SELECT DISTINCT name, description, duration, difficulty
FROM workout_plans;

-- Migrate existing workout plan exercises to template exercises
INSERT INTO template_workout_plan_exercises (
    template_plan_id,
    exercise_id,
    sets,
    reps,
    weight,
    duration,
    rest_time,
    "order"
)
SELECT 
    tp.id,
    wpe.exercise_id,
    wpe.sets,
    wpe.reps,
    wpe.weight,
    wpe.duration,
    wpe.rest_time,
    wpe."order"
FROM workout_plan_exercises wpe
JOIN workout_plans wp ON wpe.workout_plan_id = wp.id
JOIN template_workout_plans tp ON wp.name = tp.name AND wp.description = tp.description;

-- Create user workout plans from existing plans
INSERT INTO user_workout_plans (user_id, template_plan_id, schedule)
SELECT 
    wp.user_id,
    tp.id,
    '{}'::text[]
FROM workout_plans wp
JOIN template_workout_plans tp ON wp.name = tp.name AND wp.description = tp.description;

-- Drop old tables
DROP TABLE workout_plan_exercises;
DROP TABLE workout_plans; 