const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function testConnection() {
    console.log('Testing connection with:');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Password set:', !!process.env.DB_PASSWORD);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Successfully connected to MySQL!');
        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log('Test query result:', rows[0].solution);
        await connection.end();
    } catch (err) {
        console.error('Connection failed!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    }
}

testConnection();
