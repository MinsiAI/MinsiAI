CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NULL,
  provider_subject_hash VARCHAR(128) NULL,
  auth_provider VARCHAR(32) NOT NULL DEFAULT 'email',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_provider_subject (auth_provider, provider_subject_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admin_users_email (email),
  INDEX idx_admin_users_status_role (status, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS safety_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  event_type VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  metadata_redacted JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_safety_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS research_feedback (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  rating VARCHAR(64) NOT NULL,
  feedback_type VARCHAR(64) NULL,
  feedback_text TEXT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  review_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  display_text TEXT NULL,
  redacted_text TEXT NULL,
  reviewed_at DATETIME NULL,
  reviewed_by_admin_id BIGINT NULL,
  rejection_reason_code VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_research_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_research_feedback_review_status (review_status, created_at),
  INDEX idx_research_feedback_approved (is_approved, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE research_feedback ADD COLUMN IF NOT EXISTS review_status VARCHAR(32) NOT NULL DEFAULT 'pending';
ALTER TABLE research_feedback ADD COLUMN IF NOT EXISTS display_text TEXT NULL;
ALTER TABLE research_feedback ADD COLUMN IF NOT EXISTS redacted_text TEXT NULL;
ALTER TABLE research_feedback ADD COLUMN IF NOT EXISTS reviewed_at DATETIME NULL;
ALTER TABLE research_feedback ADD COLUMN IF NOT EXISTS reviewed_by_admin_id BIGINT NULL;
ALTER TABLE research_feedback ADD COLUMN IF NOT EXISTS rejection_reason_code VARCHAR(64) NULL;

UPDATE research_feedback
SET review_status = CASE WHEN is_approved THEN 'approved' ELSE 'pending' END
WHERE review_status IS NULL OR review_status = '';

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id BIGINT NULL,
  admin_user_hash VARCHAR(128) NOT NULL,
  action VARCHAR(128) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(128) NULL,
  result VARCHAR(32) NOT NULL,
  request_id VARCHAR(128) NOT NULL,
  ip_hash VARCHAR(128) NULL,
  metadata_redacted JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_audit_created_at (created_at),
  INDEX idx_admin_audit_target (target_type, target_id),
  INDEX idx_admin_audit_admin (admin_user_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
