const pool = require('./db');

async function addBioColumn() {
    try {
        await pool.execute('ALTER TABLE users ADD COLUMN bio TEXT AFTER email');
        console.log("Bio column added successfully");
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Bio column already exists");
            process.exit(0);
        }
        console.error("Error adding column:", error);
        process.exit(1);
    }
}

addBioColumn();
