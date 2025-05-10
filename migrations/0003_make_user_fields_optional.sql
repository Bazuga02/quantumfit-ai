-- Make user fields optional
ALTER TABLE users 
  ALTER COLUMN current_weight DROP NOT NULL,
  ALTER COLUMN goal_weight DROP NOT NULL,
  ALTER COLUMN height DROP NOT NULL,
  ALTER COLUMN gender DROP NOT NULL,
  ALTER COLUMN age DROP NOT NULL,
  ALTER COLUMN activity_level DROP NOT NULL; 