const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function hardReset() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("Performing Hard Reset of User Community Data...");

        // 1. Reset all users to 'global' first
        await connection.execute("UPDATE users SET community_id = 'global', community_name = 'Global Earth Guardians'");

        // 2. Clear all non-global communities to remove 'Tiruporur' ghosts
        await connection.execute("DELETE FROM communities WHERE id != 'global'");

        console.log("Success! All users reset to Global. Ghost communities deleted.");
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

hardReset();
