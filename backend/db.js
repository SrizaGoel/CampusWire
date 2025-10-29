// // db.js - MySQL connection pool using mysql2/promise
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '',
//   database: process.env.DB_NAME || 'campuswire_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = pool;

// db.js - CORRECTED VERSION
const mysql = require('mysql2/promise');  // Make sure to use mysql2/promise
require('dotenv').config();

console.log('Database configuration:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  database: process.env.DB_NAME || 'campuswire_db',
  hasPassword: !!process.env.DB_PASS
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Sriza*789',  // Use empty string if no password
  database: process.env.DB_NAME || 'campuswire_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    
    // Test basic query
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Database query test passed:', rows[0].result);
    
  } catch (err) {
    console.log('❌ Database connection failed:', err.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Is MySQL running?');
    console.log('2. Check DB credentials in .env file');
    console.log('3. Did you create the database? Run: database/campuswire_schema.sql');
    console.log('4. Try connecting manually: mysql -u root -p');
  }
}

testConnection();

module.exports = pool;