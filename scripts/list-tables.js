require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listTables() {
  try {
    const client = await pool.connect();
    
    // Get all tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    await pool.end();
  }
}

listTables(); 