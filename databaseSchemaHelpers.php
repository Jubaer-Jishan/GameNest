<?php
// Helper functions to ensure required tables exist for user activity tracking

if (!function_exists('ensureUserMediaTable')) {
    function ensureUserMediaTable(PDO $pdo): void
    {
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS user_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                media_type ENUM('profile_picture','gallery','other') NOT NULL DEFAULT 'profile_picture',
                file_path VARCHAR(500) NOT NULL,
                file_name VARCHAR(255) DEFAULT NULL,
                mime_type VARCHAR(100) DEFAULT NULL,
                file_size INT UNSIGNED DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_user_media (user_id, media_type),
                CONSTRAINT fk_user_media_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    }
}

if (!function_exists('ensureUserRentalsTable')) {
    function ensureUserRentalsTable(PDO $pdo): void
    {
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS user_rentals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                game_id VARCHAR(64) DEFAULT NULL,
                game_title VARCHAR(255) NOT NULL,
                duration ENUM('week','month','custom') NOT NULL DEFAULT 'week',
                price DECIMAL(10,2) NOT NULL DEFAULT 0,
                platforms VARCHAR(255) DEFAULT NULL,
                image_url VARCHAR(500) DEFAULT NULL,
                status ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
                rented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_user_rentals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_rentals_user (user_id),
                INDEX idx_user_rentals_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    }
}

if (!function_exists('ensureUserBidsTable')) {
    function ensureUserBidsTable(PDO $pdo): void
    {
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS user_bids (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                game_id VARCHAR(64) DEFAULT NULL,
                game_title VARCHAR(255) NOT NULL,
                bid_amount DECIMAL(10,2) NOT NULL,
                image_url VARCHAR(500) DEFAULT NULL,
                status ENUM('active','won','lost','cancelled') NOT NULL DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_user_bids_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_bids_user (user_id),
                INDEX idx_user_bids_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    }
}
