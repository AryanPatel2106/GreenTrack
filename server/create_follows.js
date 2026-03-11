const pool = require('./db');

async function createFollowsTable() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS follows (
                id INT AUTO_INCREMENT PRIMARY KEY,
                follower_id VARCHAR(128) NOT NULL,
                target_id VARCHAR(128) NOT NULL,
                status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_follow (follower_id, target_id),
                FOREIGN KEY (follower_id) REFERENCES users(uid),
                FOREIGN KEY (target_id) REFERENCES users(uid)
            )
        `);
        console.log("Follows table created successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error creating table:", error);
        process.exit(1);
    }
}

createFollowsTable();
