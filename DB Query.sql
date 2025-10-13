-- =============================================================
-- GameNest Database Bootstrap Script (Complete & Final)
-- Run this in your MySQL client or phpMyAdmin
-- =============================================================

-- 1. Create database
CREATE DATABASE IF NOT EXISTS gamenest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gamenest;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) DEFAULT NULL,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  title VARCHAR(100) DEFAULT 'Newbie',
  bio TEXT DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  member_since DATETIME DEFAULT CURRENT_TIMESTAMP,
  favorite_genre VARCHAR(100) DEFAULT NULL,
  level INT DEFAULT 1,
  global_rank INT DEFAULT NULL,
  xp_current INT DEFAULT 0,
  xp_next_level INT DEFAULT 1000,
  current_streak INT DEFAULT 0,
  season_rank VARCHAR(50) DEFAULT 'Bronze I',
  win_ratio DECIMAL(5,2) DEFAULT 0.00,
  guild_name VARCHAR(255) DEFAULT NULL,
  is_online TINYINT(1) DEFAULT 0,
  upcoming_event VARCHAR(255) DEFAULT NULL,
  upcoming_event_date DATE DEFAULT NULL,
  profile_picture VARCHAR(500) DEFAULT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_email (email),
  UNIQUE KEY uniq_username (username),
  INDEX idx_level (level),
  INDEX idx_global_rank (global_rank),
  INDEX idx_is_online (is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Rental Games
CREATE TABLE IF NOT EXISTS rental_games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(255),
  platforms VARCHAR(255),
  weekly_price DECIMAL(10,2) NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  available TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bidding Games
CREATE TABLE IF NOT EXISTS bidding_games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(255),
  platform VARCHAR(100),
  `condition` VARCHAR(50),
  current_bid DECIMAL(10,2) NOT NULL,
  min_bid DECIMAL(10,2) NOT NULL,
  time_left VARCHAR(50),
  total_bids INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sales Games
CREATE TABLE IF NOT EXISTS sales_games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(255),
  platforms VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  `condition` VARCHAR(50) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bids (for auctions)
CREATE TABLE IF NOT EXISTS bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  user_id INT NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES bidding_games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Active Rentals
CREATE TABLE IF NOT EXISTS active_rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  user_id INT NOT NULL,
  rental_type VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES rental_games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Password Resets
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_token_hash (token_hash),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. User Bids
CREATE TABLE IF NOT EXISTS user_bids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id VARCHAR(64),
  game_title VARCHAR(255) NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  status ENUM('active','inactive','won','lost','cancelled','pending','expired','processing','failed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. User Media
CREATE TABLE IF NOT EXISTS user_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  media_type ENUM('profile_picture','banner','video','audio','screenshot','clip','avatar','cover','icon','logo','file','cv','attachment','badge','tag') NOT NULL DEFAULT 'profile_picture',
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(100),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. User Rentals History
CREATE TABLE IF NOT EXISTS user_rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id VARCHAR(64),
  game_title VARCHAR(255) NOT NULL,
  duration ENUM('day','week','month','year','hour','custom') NOT NULL DEFAULT 'week',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  platforms VARCHAR(255),
  image_url VARCHAR(500),
  status ENUM('active','returned','late','cancelled','pending','expired','processing','failed','refunded') NOT NULL DEFAULT 'active',
  rented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Seed Admin User (password = admin123)
INSERT INTO users (full_name, username, email, password, role)
VALUES (
  'GameNest Admin',
  'admin',
  'admin@gamenest.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
)
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- 13. Default role fix for null
UPDATE users SET role = 'user' WHERE role IS NULL;

-- ✅ Sanity check
SELECT '✅ GameNest schema ready!' AS status,
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM rental_games) AS total_rental_games;
