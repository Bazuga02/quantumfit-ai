-- Migration: Add trained_body_parts table
CREATE TABLE IF NOT EXISTS trained_body_parts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    body_part TEXT NOT NULL,
    date TIMESTAMP DEFAULT now()
); 