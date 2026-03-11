const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function cleanGlobalGhosts() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("Searching for users in 'global' community...");
        const [users] = await connection.execute("SELECT uid, name, points, community_name FROM users WHERE community_id = 'global'");

        console.table(users);

        if (users.length > 0) {
            console.log("Deleting ghost users in Global...");
            await connection.execute("DELETE FROM users WHERE community_id = 'global'");
            console.log("Ghost users deleted.");
        } else {
            console.log("No users found in Global. Strange.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

cleanGlobalGhosts();
