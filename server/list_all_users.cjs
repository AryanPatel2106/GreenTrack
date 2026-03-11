const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function listUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("=== ALL USERS IN DB ===");
        const [users] = await connection.execute("SELECT uid, name, email, points, community_name FROM users ORDER BY points DESC");
        console.table(users);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

listUsers();
