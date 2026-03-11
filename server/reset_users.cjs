const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function reset() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("Resetting all users to 'global' to trigger fresh city sync...");
        const [result] = await connection.execute(
            "UPDATE users SET community_id = 'global', community_name = 'Global Earth Guardians'"
        );
        console.log(`Reset ${result.affectedRows} user(s).`);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

reset();
