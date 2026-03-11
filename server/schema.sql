CREATE DATABASE IF NOT EXISTS green_track;
USE green_track;

CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    photo_url TEXT,
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    trees_planted INT DEFAULT 0,
    verified_posts INT DEFAULT 0,
    role VARCHAR(50) DEFAULT 'user',
    community_id VARCHAR(50) DEFAULT 'global',
    community_name VARCHAR(255) DEFAULT 'Global Earth Guardians',
    is_community_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tree_tag VARCHAR(50) NOT NULL,
    species VARCHAR(255) NOT NULL,
    planted_date DATE,
    location VARCHAR(255),
    caretaker_id VARCHAR(128),
    health_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caretaker_id) REFERENCES users(uid),
    UNIQUE KEY unique_user_tree (caretaker_id, tree_tag)
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(128),
    user_name VARCHAR(255),
    user_photo TEXT,
    tree_id INT,
    caption TEXT,
    image_url TEXT,
    has_image BOOLEAN DEFAULT FALSE,
    community_id VARCHAR(50),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    status VARCHAR(50) DEFAULT 'verified',
    ai_species VARCHAR(255),
    is_ai_verified BOOLEAN DEFAULT FALSE,
    upvotes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid),
    FOREIGN KEY (tree_id) REFERENCES trees(id)
);

CREATE TABLE IF NOT EXISTS communities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    leader_id VARCHAR(128),
    leader_name VARCHAR(255),
    leader_photo TEXT,
    leader_points INT,
    community_points INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(uid)
);
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    user_id VARCHAR(128),
    user_name VARCHAR(255),
    user_photo TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(uid)
);
 
CREATE TABLE IF NOT EXISTS follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id VARCHAR(128) NOT NULL,
    target_id VARCHAR(128) NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, target_id),
    FOREIGN KEY (follower_id) REFERENCES users(uid),
    FOREIGN KEY (target_id) REFERENCES users(uid)
);
