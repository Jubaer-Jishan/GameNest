-- GameNest Database Update Script
-- Run this if you already have the users table

USE gamenest;

-- Add role column to existing users table (run this separately if needed)
-- Skip if this gives an error about duplicate column
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Update existing users to have 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Insert or update admin user (password: admin123)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@gamenest.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';
