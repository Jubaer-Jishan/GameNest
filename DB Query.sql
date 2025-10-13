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

INSERT INTO users (full_name, username, email, password, role)
VALUES (
  'GameNest Admin',
  'admin',
  'admin@gamenest.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
)
ON DUPLICATE KEY UPDATE role = VALUES(role);

UPDATE users SET role = 'user' WHERE role IS NULL;

-- 14. Seed canonical rental & bidding games (optional)
START TRANSACTION;

-- Purge existing rental rows that match our curated list to avoid duplicates
DELETE FROM rental_games
WHERE title IN (
  'Elden Ring',
  'God of War (2018)',
  'Sekiro: Shadows Die Twice',
  'Spider Man',
  'Dark Souls 3',
  'Red Dead Redemption 2',
  'Assassin''s Creed Mirage',
  'FC 26',
  'Dishonored',
  'Little Nightmares',
  'GTA V',
  'Hollow-Knight Silksong',
  'F1 25',
  'DOOM Dark Ages',
  'Ghost of Yotei',
  'Hell is Us'
);

INSERT INTO rental_games (title, image, platforms, weekly_price, monthly_price, available)
VALUES
  ('Elden Ring', 'sliderImage/11.jpg', 'PS4/PS5, Xbox One/Series', 6.00, 17.00, 1),
  ('God of War (2018)', 'sliderImage/10.jpg', 'PC, PS4/PS5', 5.00, 15.00, 1),
  ('Sekiro: Shadows Die Twice', 'sliderImage/3.jpeg', 'PS4, PS5, PC', 7.00, 19.00, 1),
  ('Spider Man', 'sliderImage/14.jpg', 'PS5, PC', 6.00, 18.00, 1),
  ('Dark Souls 3', 'sliderImage/6.jpeg', 'PC, PS4/PS5, Switch', 8.00, 21.00, 1),
  ('Red Dead Redemption 2', 'sliderImage/1.jpeg', 'PS4, Xbox One, PC', 7.00, 22.00, 1),
  ('Assassin''s Creed Mirage', 'sliderImage/9.jpg', 'PC, PS5', 5.00, 17.00, 1),
  ('FC 26', 'sliderImage/8.jpg', 'PC, PS5, Xbox One/Series', 6.00, 16.00, 1),
  ('Dishonored', 'sliderImage/17.jpg', 'PC, PS4', 7.00, 19.00, 1),
  ('Little Nightmares', 'sliderImage/18.jpg', 'Switch, PS4', 8.00, 18.00, 1),
  ('GTA V', 'sliderImage/19.jpg', 'PS4/PS5, Xbox Series X/S', 6.00, 20.00, 1),
  ('Hollow-Knight Silksong', 'sliderImage/20.jpg', 'Switch, PC', 5.00, 15.00, 1),
  ('F1 25', 'sliderImage/21.jpg', 'PC, Xbox One/Series', 7.00, 19.00, 1),
  ('DOOM Dark Ages', 'sliderImage/22.jpg', 'PC, PS5', 6.00, 18.00, 1),
  ('Ghost of Yotei', 'sliderImage/23.jpg', 'PS4, Switch', 8.00, 21.00, 1),
  ('Hell is Us', 'sliderImage/24.jpg', 'PC, Xbox One/Series', 6.00, 17.00, 1);

-- Purge existing bidding rows that match our curated list to avoid duplicates
DELETE FROM bidding_games
WHERE title IN (
  'Bloodborne',
  'FC 26',
  'God of War',
  'Minecraft',
  'Spider-Man',
  'Until Dawn',
  'Red Dead Redemption 2',
  'NBA',
  'The Witcher 3',
  'Dishonored',
  'Little Nightmares',
  'GTA V',
  'Hollow-Knight Silksong',
  'F1 25',
  'DOOM Dark Ages',
  'Ghost of Yotei',
  'Hell is Us'
);

INSERT INTO bidding_games (title, image, platform, `condition`, current_bid, min_bid, time_left, status)
VALUES
  ('Bloodborne', 'https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg', 'PlayStation', 'Used - Good', 50.00, 55.00, '2d 5h', 'active'),
  ('FC 26', 'sliderImage/8.jpg', 'Multi-Platform', 'New', 40.00, 45.00, '3d 4h', 'active'),
  ('God of War', 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg', 'PlayStation', 'Collector''s Edition', 60.00, 65.00, '1d 20h', 'active'),
  ('Minecraft', 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png', 'All Platforms', 'Used - Fair', 30.00, 35.00, '4d 2h', 'active'),
  ('Spider-Man', 'sliderImage/14.jpg', 'PlayStation', 'Like New', 55.00, 60.00, '22h 15m', 'active'),
  ('Until Dawn', 'sliderImage/15.jpg', 'PlayStation', 'Used - Good', 35.00, 40.00, '18h 30m', 'active'),
  ('Red Dead Redemption 2', 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg', 'PlayStation & Xbox', 'Collector''s Steelbook', 70.00, 75.00, '1d 8h', 'active'),
  ('NBA', 'sliderImage/16.jpg', 'PlayStation', 'New', 20.00, 25.00, '12h 10m', 'active'),
  ('The Witcher 3', 'sliderImage/12.jpg', 'PC & PlayStation', 'Used - Excellent', 70.00, 75.00, '2d 12h', 'active'),
  ('Dishonored', 'sliderImage/17.jpg', 'PC & Xbox', 'Used - Good', 45.00, 50.00, '3d 6h', 'active'),
  ('Little Nightmares', 'sliderImage/18.jpg', 'Switch & PlayStation', 'New', 35.00, 40.00, '1d 4h', 'active'),
  ('GTA V', 'sliderImage/19.jpg', 'PS5 & Xbox Series', 'Used - Good', 60.00, 65.00, '2d 1h', 'active'),
  ('Hollow-Knight Silksong', 'sliderImage/20.jpg', 'Switch & PC', 'Preorder Bundle', 55.00, 60.00, '21h 45m', 'active'),
  ('F1 25', 'sliderImage/21.jpg', 'PC & Xbox', 'New', 40.00, 45.00, '19h 5m', 'active'),
  ('DOOM Dark Ages', 'sliderImage/22.jpg', 'PC & PS5', 'Deluxe Edition', 50.00, 55.00, '16h 20m', 'active'),
  ('Ghost of Yotei', 'sliderImage/23.jpg', 'PS4 & Switch', 'Used - Excellent', 45.00, 50.00, '2d 9h', 'active'),
  ('Hell is Us', 'sliderImage/24.jpg', 'PC & Xbox', 'New', 40.00, 45.00, '3d 1h', 'active');

COMMIT;

-- ✅ Sanity check
SELECT '✅ GameNest schema ready!' AS status,
       (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM rental_games) AS total_rental_games;
