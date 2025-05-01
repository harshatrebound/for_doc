/**
 * Content System Status Check
 * 
 * This script will check:
 * 1. Database connection
 * 2. Content in database
 * 3. CSV files
 * 4. Fallback mode status
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Create Prisma client
const prisma = new PrismaClient();

// CSV file paths
const csvFiles = [
  { path: 'docs/bone_joint_school_cms.csv', pageType: 'bone-joint-school' },
  { path: 'docs/procedure_surgery_cms.csv', pageType: 'procedure-surgery' },
  { path: 'docs/post_cms.csv', pageType: 'post' },
];

// Check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection is active.');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

// Check content in database
async function checkDatabaseContent() {
  try {
    // Count pages
    const pageCount = await prisma.page.count();
    console.log(`📄 Database has ${pageCount} content pages.`);
    
    // Count categories
    const categoryCount = await prisma.category.count();
    console.log(`📚 Database has ${categoryCount} categories.`);
    
    // Count content blocks
    const blockCount = await prisma.contentBlock.count();
    console.log(`🧩 Database has ${blockCount} content blocks.`);
    
    // Get page types
    const pageTypes = await prisma.page.groupBy({
      by: ['pageType'],
      _count: {
        pageType: true,
      },
    });
    
    console.log('📊 Content by page type:');
    pageTypes.forEach(type => {
      console.log(`   - ${type.pageType}: ${type._count.pageType} pages`);
    });
    
    return { pageCount, categoryCount, blockCount, pageTypes };
  } catch (error) {
    console.log('❌ Error checking database content:', error.message);
    return null;
  }
}

// Check CSV files
async function checkCsvFiles() {
  const csvStats = [];
  
  for (const csvFile of csvFiles) {
    const filePath = path.join(process.cwd(), csvFile.path);
    
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsedCsv = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
        });
        
        csvStats.push({
          path: csvFile.path,
          pageType: csvFile.pageType,
          rowCount: parsedCsv.data.length,
          exists: true,
        });
        
        console.log(`📄 CSV: ${csvFile.path} has ${parsedCsv.data.length} rows.`);
      } else {
        csvStats.push({
          path: csvFile.path,
          pageType: csvFile.pageType,
          rowCount: 0,
          exists: false,
        });
        
        console.log(`❌ CSV: ${csvFile.path} does not exist.`);
      }
    } catch (error) {
      console.log(`❌ Error reading CSV ${csvFile.path}:`, error.message);
      csvStats.push({
        path: csvFile.path,
        pageType: csvFile.pageType,
        rowCount: 0,
        exists: false,
        error: error.message,
      });
    }
  }
  
  return csvStats;
}

// Check fallback mode
function checkFallbackMode() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/ENABLE_CSV_FALLBACK=(true|false)/);
      
      if (match) {
        const isEnabled = match[1] === 'true';
        console.log(`🔄 CSV Fallback Mode: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
        return isEnabled;
      }
    }
    
    console.log('⚠️ CSV Fallback Mode is not configured in .env file.');
    return null;
  } catch (error) {
    console.log('❌ Error checking fallback mode:', error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('==================================================');
  console.log('🔍 CONTENT SYSTEM STATUS CHECK');
  console.log('==================================================');
  
  // Check database connection
  const isDbConnected = await checkDatabaseConnection();
  
  console.log('\n--- Database Content ---');
  if (isDbConnected) {
    await checkDatabaseContent();
  }
  
  console.log('\n--- CSV Content ---');
  const csvStats = await checkCsvFiles();
  
  console.log('\n--- Fallback Mode ---');
  const fallbackEnabled = checkFallbackMode();
  
  console.log('\n==================================================');
  console.log('Summary:');
  console.log(`- Database connection: ${isDbConnected ? 'Active' : 'Inactive'}`);
  console.log(`- CSV fallback mode: ${fallbackEnabled === true ? 'Enabled' : fallbackEnabled === false ? 'Disabled' : 'Not configured'}`);
  console.log('- CSV files found:', csvStats.filter(s => s.exists).length);
  console.log('- CSV files missing:', csvStats.filter(s => !s.exists).length);
  console.log('==================================================');
  
  // Disconnect Prisma
  await prisma.$disconnect();
}

// Run the script
main()
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  }); 