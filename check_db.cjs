const pool = require('./server/db');
require('dotenv').config();

async function check() {
    try {
        const [rows] = await pool.execute('SELECT uid, name, points, community_id, community_name FROM users');
        console.log("=== USERS IN DATABASE ===");
        console.table(rows);

        const [comms] = await pool.execute('SELECT id, name, community_points FROM communities');
        console.log("=== COMMUNITIES IN DATABASE ===");
        console.table(comms);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
