import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Initialize Prisma client
const prisma = new PrismaClient();

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupTable(tableName, fileName) {
  console.log(`Backing up ${tableName}...`);
  try {
    // Use dynamic query to get all records from the table
    const records = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    
    // Write to JSON file
    const backupPath = path.join(BACKUP_DIR, `${fileName}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(records, null, 2));
    
    console.log(`Successfully backed up ${tableName} to ${backupPath}`);
    return { tableName, count: records.length };
  } catch (error) {
    console.error(`Error backing up ${tableName}:`, error);
    return { tableName, error: error.message };
  }
}

async function main() {
  console.log('Starting database backup...');
  
  try {
    // Get all table names from the database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const tableNames = tables.map(t => t.table_name);
    console.log(`Found ${tableNames.length} tables: ${tableNames.join(', ')}`);
    
    // Backup each table
    const results = [];
    for (const tableName of tableNames) {
      const result = await backupTable(tableName, tableName);
      results.push(result);
    }
    
    // Create a summary file
    const summaryPath = path.join(BACKUP_DIR, 'backup-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      tables: results,
    }, null, 2));
    
    console.log('Backup completed successfully!');
  } catch (error) {
    console.error('Error during backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error('Unhandled error during backup:', e);
    process.exit(1);
  }); 