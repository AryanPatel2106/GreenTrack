const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function listGlobalUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("Listing users in 'global' community...");
        const [users] = await connection.execute("SELECT uid, name, points, community_name FROM users WHERE community_id = 'global'");
        console.table(users);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

listGlobalUsers();
