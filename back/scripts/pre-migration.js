import mysql from 'mysql2/promise';

async function migrate() {
  console.log('Connecting to civilbridge DB...');
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'admin123',
      database: 'civilbridge',
      port: 3306
    });
    console.log('Connected.');
    
    // Safely migrate deprecated roles to valid existing roles 
    // BEFORE Prisma enforces strict dropdown enum rules.
    await connection.execute(`UPDATE users SET role = 'HOME_BUILDER' WHERE role IN ('CLIENT', 'USER')`);
    await connection.execute(`UPDATE users SET role = 'ENGINEER' WHERE role IN ('PROFESSIONAL', 'CONTRACTOR', 'SUPPLIER')`);
    
    console.log('Depreciated role migration successful.');
    await connection.end();
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
      console.log('Initial Setup: Database or tables do not exist yet. Safe to proceed with push.');
    } else {
      console.error('Migration failed:', err.message);
    }
  }
}

migrate();
