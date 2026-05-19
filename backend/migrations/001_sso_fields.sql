-- ============================================================
--  Migration 001 – SSO support fields
--  Run this against your existing `nousqa_platform` database
--  BEFORE deploying the updated backend.
-- ============================================================

-- 1. Allow password_hash to be NULL (SSO users have no local password)
ALTER TABLE users
  MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- 2. Add the sso_provider column to record which IdP the user signed in with
--    (NULL = regular password login, 'microsoft' = Azure AD SSO)
ALTER TABLE users
  ADD COLUMN sso_provider VARCHAR(50) NULL DEFAULT NULL
  AFTER is_active;

-- Verify
DESCRIBE users;
