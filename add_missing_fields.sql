-- ============================================
-- ADD MISSING PROFILE FIELDS TO EXISTING DATABASE
-- Run this in phpMyAdmin if your users table is missing any fields
-- ============================================

USE gamenest;

-- Check existing columns first (run this to see what you have)
DESCRIBE users;

-- ============================================
-- ADD PROFILE FIELDS (if they don't exist)
-- ============================================

-- Basic profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Newbie';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_since DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_genre VARCHAR(100) DEFAULT NULL;

-- Game stats fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS global_rank INT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_current INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_next_level INT DEFAULT 1000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS season_rank VARCHAR(50) DEFAULT 'Bronze I';
ALTER TABLE users ADD COLUMN IF NOT EXISTS win_ratio DECIMAL(5,2) DEFAULT 0.00;

-- Social features
ALTER TABLE users ADD COLUMN IF NOT EXISTS guild_name VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT 0;

-- Events
ALTER TABLE users ADD COLUMN IF NOT EXISTS upcoming_event VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS upcoming_event_date DATE DEFAULT NULL;

-- Media
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL;

-- ============================================
-- ADD INDEXES FOR BETTER PERFORMANCE (optional)
-- ============================================

-- Only add if they don't exist
CREATE INDEX IF NOT EXISTS idx_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_global_rank ON users(global_rank);
CREATE INDEX IF NOT EXISTS idx_is_online ON users(is_online);

-- ============================================
-- UPDATE EXISTING USERS WITH DEFAULT VALUES (optional)
-- ============================================

-- Set default level for existing users
UPDATE users SET level = 1 WHERE level IS NULL OR level = 0;

-- Set default XP values
UPDATE users SET xp_current = 0 WHERE xp_current IS NULL;
UPDATE users SET xp_next_level = 1000 WHERE xp_next_level IS NULL;

-- Set default title
UPDATE users SET title = 'Newbie' WHERE title IS NULL;

-- Set default season rank
UPDATE users SET season_rank = 'Bronze I' WHERE season_rank IS NULL;

-- Set member_since to created_at if available
UPDATE users SET member_since = created_at WHERE member_since IS NULL AND created_at IS NOT NULL;

-- ============================================
-- VERIFY CHANGES
-- ============================================

-- View updated structure
DESCRIBE users;

-- Count total fields (should be at least 22)
SELECT COUNT(*) as total_fields FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'gamenest' AND TABLE_NAME = 'users';

-- View sample data
SELECT id, email, full_name, username, level, xp_current, is_online 
FROM users 
LIMIT 5;

-- Success message
SELECT 
  '✅ Database update complete!' as status,
  (SELECT COUNT(*) FROM information_schema.COLUMNS 
   WHERE TABLE_SCHEMA = 'gamenest' AND TABLE_NAME = 'users') as total_fields,
  (SELECT COUNT(*) FROM users) as total_users;
