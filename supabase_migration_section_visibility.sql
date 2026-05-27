-- Migration: add section_visibility to portfolios
-- Run this once in your Supabase SQL Editor to enable the section-visibility toggles.
-- Safe to run multiple times (IF NOT EXISTS). Existing portfolios default to all sections visible.

ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS section_visibility JSONB
  DEFAULT '{"about":true,"skills":true,"projects":true,"experience":true,"contact":true}'::jsonb;

-- Backfill any existing rows that have NULL (e.g. added without a default)
UPDATE portfolios
SET section_visibility = '{"about":true,"skills":true,"projects":true,"experience":true,"contact":true}'::jsonb
WHERE section_visibility IS NULL;
