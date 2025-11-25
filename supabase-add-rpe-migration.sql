-- Migration to add RPE column to existing Set table
-- Run this in Supabase SQL Editor if you already ran the initial schema

ALTER TABLE "Set" 
ADD COLUMN IF NOT EXISTS rpe DOUBLE PRECISION;

