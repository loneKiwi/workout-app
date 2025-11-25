-- Supabase Database Schema for beef workout app
-- Run this in your Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercise table
CREATE TABLE IF NOT EXISTS "Exercise" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout table
CREATE TABLE IF NOT EXISTS "Workout" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Set table
CREATE TABLE IF NOT EXISTS "Set" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reps INTEGER NOT NULL,
  weight DOUBLE PRECISION NOT NULL,
  rpe DOUBLE PRECISION,
  "exerciseId" TEXT NOT NULL REFERENCES "Exercise"(id) ON DELETE RESTRICT,
  "workoutId" TEXT NOT NULL REFERENCES "Workout"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_set_exercise_id ON "Set"("exerciseId");
CREATE INDEX IF NOT EXISTS idx_set_workout_id ON "Set"("workoutId");
CREATE INDEX IF NOT EXISTS idx_exercise_category ON "Exercise"(category);
CREATE INDEX IF NOT EXISTS idx_workout_date ON "Workout"(date DESC);

-- Enable Row Level Security (RLS) - optional, but good practice
ALTER TABLE "Exercise" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Set" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since it's a personal app)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations on Exercise" ON "Exercise"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on Workout" ON "Workout"
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on Set" ON "Set"
  FOR ALL USING (true) WITH CHECK (true);

