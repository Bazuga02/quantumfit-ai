CREATE TABLE IF NOT EXISTS progress_photos (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id),
  url text NOT NULL,
  date timestamp DEFAULT now(),
  body_part text,
  note text
); 