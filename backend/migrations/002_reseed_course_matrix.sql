-- ============================================================
--  Migration 002 – Re-seed course matrix
--  Run this BEFORE restarting the backend when course_matrix.json
--  has been replaced with a new version that uses different course IDs.
--
--  What this does:
--    1. Clears all user progress (module_progress_current, progress_events)
--    2. Clears all profile–module assignments (profile_modules)
--    3. Clears all roadmap modules (roadmap_modules)
--    4. After the backend restarts, seed.run() will re-populate
--       roadmap_modules and profile_modules from the new course_matrix.json
--
--  WARNING: Steps 1 clears user progress data. Only run this if you are
--  resetting the platform (e.g. before go-live / during development).
--  On a live production system, keep user progress and only clear modules.
-- ============================================================

USE nousqa_platform;

-- Disable safe update mode for this session (re-enabled at the end)
SET SQL_SAFE_UPDATES = 0;

-- 1. Clear user progress (safe to skip on production if users have real progress)
DELETE FROM progress_events;
DELETE FROM module_progress_current;

-- 2. Clear profile-module assignments
DELETE FROM profile_modules;

-- 3. Clear all old roadmap modules
DELETE FROM roadmap_modules;

-- Verify tables are empty
SELECT 'roadmap_modules' AS tbl, COUNT(*) AS remaining FROM roadmap_modules
UNION ALL
SELECT 'profile_modules', COUNT(*) FROM profile_modules
UNION ALL
SELECT 'module_progress_current', COUNT(*) FROM module_progress_current
UNION ALL
SELECT 'progress_events', COUNT(*) FROM progress_events;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- After running this SQL, restart the backend with:
--   uvicorn main:app --reload
-- seed.run() will automatically insert all 110 new courses and their profile assignments.
