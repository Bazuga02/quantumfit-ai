-- Template workout plans
CREATE TABLE IF NOT EXISTS template_workout_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User's workout plans (references template)
CREATE TABLE IF NOT EXISTS user_workout_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_plan_id INTEGER REFERENCES template_workout_plans(id) ON DELETE CASCADE,
    schedule TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template workout plan exercises
CREATE TABLE IF NOT EXISTS template_workout_plan_exercises (
    id SERIAL PRIMARY KEY,
    template_plan_id INTEGER REFERENCES template_workout_plans(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight REAL,
    duration INTEGER,
    rest_time INTEGER NOT NULL,
    order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drop old tables if they exist
DROP TABLE IF EXISTS workout_plan_exercises;
DROP TABLE IF EXISTS workout_plans; 