const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function debug() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [users] = await connection.execute('SELECT uid, name, community_name, points FROM users');
        console.log("=== USERS ===");
        console.table(users);

        const [comms] = await connection.execute('SELECT id, name, community_points FROM communities WHERE community_points > 0');
        console.log("=== ACTIVE COMMUNITIES (Static Table) ===");
        console.table(comms);

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

debug();
