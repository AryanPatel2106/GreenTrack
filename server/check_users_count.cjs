const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute("SELECT name, email, points FROM users");
        console.log(`Total Users: ${rows.length}`);
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

checkUsers();
