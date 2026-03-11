const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function nukeGlobalGhosts() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("Finding users in 'global'...");
        const [users] = await connection.execute("SELECT uid FROM users WHERE community_id = 'global'");

        if (users.length === 0) {
            console.log("No users found in global.");
            return;
        }

        const uids = users.map(u => u.uid);
        console.log(`Found ${uids.length} ghost users. Nuking them...`);

        // Helper to handle IN clause for array
        const placeholders = uids.map(() => '?').join(',');

        // 1. Delete Comments
        await connection.execute(`DELETE FROM comments WHERE user_id IN (${placeholders})`, uids);
        console.log("Deleted comments.");

        // 2. Delete Posts
        await connection.execute(`DELETE FROM posts WHERE user_id IN (${placeholders})`, uids);
        console.log("Deleted posts.");

        // 3. Delete Trees
        await connection.execute(`DELETE FROM trees WHERE caretaker_id IN (${placeholders})`, uids);
        console.log("Deleted trees.");

        // 4. Delete Users
        await connection.execute(`DELETE FROM users WHERE uid IN (${placeholders})`, uids);
        console.log("Deleted users.");

        // 5. Reset Community Points for global (optional, though query calculates it dynamically)
        await connection.execute("UPDATE communities SET community_points = 0 WHERE id = 'global'");

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

nukeGlobalGhosts();
