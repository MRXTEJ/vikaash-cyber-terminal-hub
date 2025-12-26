-- Add thumbnail_url column to certificates table
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS thumbnail_url text;