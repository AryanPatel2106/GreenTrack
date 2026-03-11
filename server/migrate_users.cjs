const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Manvadind8962',
        database: 'green_track'
    });

    try {
        console.log("Migrating users to city-based communities...");
        // For testing, let's just make sure at least one user is in Mumbai Community if they are currently 'global'
        const [result] = await connection.execute(
            "UPDATE users SET community_id = 'mumbai', community_name = 'Mumbai Community' WHERE community_id = 'global' LIMIT 1"
        );
        console.log(`Updated ${result.affectedRows} user(s).`);

        // Also ensure Mumbai exists in communities table
        await connection.execute(
            "INSERT IGNORE INTO communities (id, name, community_points) VALUES ('mumbai', 'Mumbai Community', 0)"
        );

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

migrate();
