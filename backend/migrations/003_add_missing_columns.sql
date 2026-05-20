-- ============================================================
--  Migration 003 – Add missing columns & tables
--  Run against `nousqa_platform` before restarting the backend.
-- ============================================================

USE nousqa_platform;

-- 1. Add event_metadata column to progress_events
--    (model defines it but it was never created in the DB)
ALTER TABLE progress_events
  ADD COLUMN IF NOT EXISTS event_metadata JSON NULL
  AFTER duration_minutes;

-- 2. Create admin_audit_log table (used for nudge events)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  admin_id     INT NOT NULL,
  action       VARCHAR(100) NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    INT,
  details      JSON,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verify
DESCRIBE progress_events;
DESCRIBE admin_audit_log;
