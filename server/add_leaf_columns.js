require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function addLeafColumns() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Connected to the database. Altering posts table...");
        
        try {
            await connection.execute('ALTER TABLE posts ADD COLUMN leaf_image_url TEXT');
            console.log("Added leaf_image_url column.");
        } catch (e) {
            console.log("Column leaf_image_url might already exist:", e.message);
        }

        try {
            await connection.execute('ALTER TABLE posts ADD COLUMN leaf_health_status VARCHAR(50)');
            console.log("Added leaf_health_status column.");
        } catch (e) {
            console.log("Column leaf_health_status might already exist:", e.message);
        }

        try {
            await connection.execute('ALTER TABLE posts ADD COLUMN is_leaf_healthy BOOLEAN DEFAULT FALSE');
            console.log("Added is_leaf_healthy column.");
        } catch (e) {
            console.log("Column is_leaf_healthy might already exist:", e.message);
        }

        console.log("Done.");
        await connection.end();
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
}

addLeafColumns();
