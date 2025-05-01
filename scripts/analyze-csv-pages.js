/**
 * CSV File and Content Usage Analysis
 * 
 * This script analyzes:
 * 1. All CSV files in /docs directory
 * 2. What content they contain
 * 3. Which pages are using which CSV files
 * 4. If there are any missing or unused files
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');

// Create Prisma client
const prisma = new PrismaClient();

// Scan the docs directory for CSV files
async function scanDocsDirectory() {
  console.log('Scanning /docs directory for CSV files...');
  
  const docsPath = path.join(process.cwd(), 'docs');
  
  try {
    // Check if docs directory exists
    if (!fs.existsSync(docsPath)) {
      console.error('Error: /docs directory not found!');
      return [];
    }
    
    // Read the directory
    const files = fs.readdirSync(docsPath);
    
    // Filter for CSV files only
    const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
    
    console.log(`Found ${csvFiles.length} CSV files in /docs directory.`);
    
    // Analyze each CSV file
    const csvDetails = [];
    
    for (const file of csvFiles) {
      const filePath = path.join(docsPath, file);
      
      try {
        // Read file content
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse CSV
        const parsedCsv = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
        });
        
        // Determine page type based on filename
        let pageType = file.replace(/_cms\.csv$/i, '').replace(/_/g, '-').toLowerCase();
        if (pageType === 'category') pageType = 'categories';
        
        // Get sample row to check fields
        const fields = parsedCsv.meta.fields || [];
        const hasPageTypeColumn = fields.includes('PageType');
        const hasSlugColumn = fields.includes('Slug');
        const hasTitleColumn = fields.includes('Title');
        const hasContentBlocksColumn = fields.includes('ContentBlocksJSON');
        
        // Check if this looks like a content CSV
        const isContentCsv = hasSlugColumn && (hasTitleColumn || hasContentBlocksColumn);
        
        // Collect unique page types if the file has PageType column
        const uniquePageTypes = new Set();
        if (hasPageTypeColumn) {
          parsedCsv.data.forEach(row => {
            if (row.PageType) uniquePageTypes.add(row.PageType);
          });
        }
        
        // Get sample pages
        const sampleRows = parsedCsv.data.slice(0, 5).map(row => ({
          slug: row.Slug,
          title: row.Title,
          pageType: row.PageType || pageType,
        }));
        
        csvDetails.push({
          filename: file,
          filePath,
          pageType,
          rowCount: parsedCsv.data.length,
          fields,
          hasPageTypeColumn,
          hasSlugColumn,
          hasTitleColumn,
          hasContentBlocksColumn,
          isContentCsv,
          uniquePageTypes: Array.from(uniquePageTypes),
          sampleRows,
        });
        
        console.log(`Analyzed ${file}: ${parsedCsv.data.length} rows, pageType=${pageType}`);
      } catch (error) {
        console.error(`Error analyzing ${file}:`, error.message);
        csvDetails.push({
          filename: file,
          filePath,
          error: error.message,
        });
      }
    }
    
    return csvDetails;
  } catch (error) {
    console.error('Error scanning docs directory:', error);
    return [];
  }
}

// Find which pages reference each CSV file
async function scanCodeForCsvReferences(csvFiles) {
  console.log('\nScanning codebase for CSV file references...');
  
  // Check common directories where CSV might be referenced
  const directoriesToCheck = [
    'src/app',
    'src/components',
    'src/lib',
    'src/utils',
  ];
  
  const references = [];
  
  // Loop through each directory
  for (const dirPath of directoriesToCheck) {
    const fullDirPath = path.join(process.cwd(), dirPath);
    
    if (!fs.existsSync(fullDirPath)) {
      continue;
    }
    
    // Recursively scan directory
    const filesInDir = await scanDirectory(fullDirPath);
    
    // Check each file for CSV references
    for (const filePath of filesInDir) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Check for each CSV file
        for (const csvFile of csvFiles) {
          const filename = csvFile.filename;
          const csvFilePathPattern = `docs/${filename}`;
          const csvFileNamePattern = filename;
          
          if (fileContent.includes(csvFilePathPattern) || fileContent.includes(csvFileNamePattern)) {
            // Extract the relative path for clarity
            const relativePath = path.relative(process.cwd(), filePath);
            
            references.push({
              csvFilename: filename,
              referencedIn: relativePath,
              pathMatch: fileContent.includes(csvFilePathPattern),
              nameMatch: fileContent.includes(csvFileNamePattern),
            });
            
            console.log(`Found reference to ${filename} in ${relativePath}`);
          }
        }
      } catch (error) {
        console.error(`Error checking file ${filePath}:`, error.message);
      }
    }
  }
  
  return references;
}

// Helper to recursively scan a directory
async function scanDirectory(dirPath) {
  const result = [];
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively scan subdirectory
      const filesInSubdir = await scanDirectory(itemPath);
      result.push(...filesInSubdir);
    } else if (stats.isFile() && (
      itemPath.endsWith('.js') ||
      itemPath.endsWith('.jsx') ||
      itemPath.endsWith('.ts') ||
      itemPath.endsWith('.tsx')
    )) {
      // Add JavaScript/TypeScript files
      result.push(itemPath);
    }
  }
  
  return result;
}

// Check database content and map to CSV files
async function checkDatabaseContent(csvFiles) {
  console.log('\nChecking database content...');
  
  try {
    // Count pages by type
    const pageTypes = await prisma.page.groupBy({
      by: ['pageType'],
      _count: {
        pageType: true,
      },
    });
    
    console.log('Pages in database by type:');
    pageTypes.forEach(type => {
      console.log(`- ${type.pageType}: ${type._count.pageType} pages`);
    });
    
    // Map page types to CSV files
    const mappings = [];
    
    for (const pageType of pageTypes) {
      // Find matching CSV files for this page type
      const matchingCsvFiles = csvFiles.filter(csv => {
        // Match by inferred page type
        if (csv.pageType === pageType.pageType) return true;
        
        // Match by unique page types in CSV
        if (csv.uniquePageTypes && csv.uniquePageTypes.includes(pageType.pageType)) return true;
        
        return false;
      });
      
      const mappingInfo = {
        pageType: pageType.pageType,
        countInDatabase: pageType._count.pageType,
        matchingCsvFiles: matchingCsvFiles.map(csv => csv.filename),
      };
      
      // Check if any sample slugs from CSV are in the database
      if (matchingCsvFiles.length > 0) {
        const sampleSlugs = [];
        
        for (const csv of matchingCsvFiles) {
          sampleSlugs.push(...csv.sampleRows.filter(row => row.slug).map(row => row.slug));
        }
        
        if (sampleSlugs.length > 0) {
          const dbPages = await prisma.page.findMany({
            where: {
              slug: { in: sampleSlugs },
              pageType: pageType.pageType,
            },
            select: { slug: true },
          });
          
          mappingInfo.samplePagesInDb = dbPages.map(p => p.slug);
          mappingInfo.coveragePercent = Math.round((dbPages.length / sampleSlugs.length) * 100);
        }
      }
      
      mappings.push(mappingInfo);
    }
    
    return { pageTypes, mappings };
  } catch (error) {
    console.error('Error checking database content:', error);
    return { pageTypes: [], mappings: [] };
  }
}

// Main function
async function main() {
  console.log('==================================================');
  console.log('🔍 CSV FILE AND CONTENT USAGE ANALYSIS');
  console.log('==================================================');
  
  try {
    // 1. Scan the docs directory for CSV files
    const csvFiles = await scanDocsDirectory();
    
    if (csvFiles.length === 0) {
      console.error('No CSV files found in /docs directory. Analysis aborted.');
      return;
    }
    
    // 2. Scan codebase for references to CSV files
    const references = await scanCodeForCsvReferences(csvFiles);
    
    // 3. Check database content and map to CSV files
    const { mappings } = await checkDatabaseContent(csvFiles);
    
    // 4. Prepare and display the final report
    console.log('\n==================================================');
    console.log('ANALYSIS REPORT:');
    console.log('==================================================');
    
    console.log('\n1. CSV FILES OVERVIEW:');
    console.log('--------------------------------------------------');
    csvFiles.forEach(csv => {
      if (csv.error) {
        console.log(`❌ ${csv.filename}: Error - ${csv.error}`);
        return;
      }
      
      const refs = references.filter(ref => ref.csvFilename === csv.filename);
      console.log(`📄 ${csv.filename}:`);
      console.log(`   - Rows: ${csv.rowCount}`);
      console.log(`   - Page Type: ${csv.pageType}`);
      
      if (csv.uniquePageTypes && csv.uniquePageTypes.length > 0) {
        console.log(`   - Page Types in CSV: ${csv.uniquePageTypes.join(', ')}`);
      }
      
      console.log(`   - Referenced in ${refs.length} files`);
      
      if (csv.sampleRows && csv.sampleRows.length > 0) {
        console.log(`   - Sample Pages: ${csv.sampleRows.slice(0, 3).map(r => r.slug || 'unknown').join(', ')}${csv.sampleRows.length > 3 ? '...' : ''}`);
      }
    });
    
    console.log('\n2. CSV REFERENCES IN CODE:');
    console.log('--------------------------------------------------');
    
    // Group references by CSV file
    const referencesByFile = {};
    references.forEach(ref => {
      if (!referencesByFile[ref.csvFilename]) {
        referencesByFile[ref.csvFilename] = [];
      }
      referencesByFile[ref.csvFilename].push(ref.referencedIn);
    });
    
    // List CSV files with references
    for (const [filename, files] of Object.entries(referencesByFile)) {
      console.log(`📋 ${filename}:`);
      console.log(`   Referenced in ${files.length} files:`);
      files.slice(0, 5).forEach(file => console.log(`   - ${file}`));
      if (files.length > 5) {
        console.log(`   - ...and ${files.length - 5} more`);
      }
    }
    
    // List CSV files with no references
    const unreferencedFiles = csvFiles
      .filter(csv => !referencesByFile[csv.filename])
      .map(csv => csv.filename);
    
    if (unreferencedFiles.length > 0) {
      console.log('\n⚠️ CSV FILES NOT REFERENCED IN CODE:');
      unreferencedFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    console.log('\n3. PAGE TYPE TO CSV MAPPING:');
    console.log('--------------------------------------------------');
    
    mappings.forEach(mapping => {
      console.log(`📂 Page Type: ${mapping.pageType}`);
      console.log(`   - Pages in Database: ${mapping.countInDatabase}`);
      
      if (mapping.matchingCsvFiles && mapping.matchingCsvFiles.length > 0) {
        console.log(`   - Matching CSV Files: ${mapping.matchingCsvFiles.join(', ')}`);
        
        if (mapping.samplePagesInDb) {
          console.log(`   - Sample Coverage: ${mapping.coveragePercent}% (${mapping.samplePagesInDb.length} pages found in database)`);
        }
      } else {
        console.log('   - ⚠️ No matching CSV files found for this page type');
      }
    });
    
    console.log('\n==================================================');
    console.log('RECOMMENDATIONS:');
    console.log('==================================================');
    
    // Add any unreferenced files
    if (unreferencedFiles.length > 0) {
      console.log('⚠️ You have CSV files that are not referenced in your code:');
      unreferencedFiles.forEach(file => console.log(`   - ${file}`));
      console.log('   These might be unused or referenced indirectly.');
    }
    
    // Add recommendations for page types without matching CSV
    const pageTypesWithoutCsv = mappings.filter(m => !m.matchingCsvFiles || m.matchingCsvFiles.length === 0);
    if (pageTypesWithoutCsv.length > 0) {
      console.log('\n⚠️ You have page types in database without matching CSV files:');
      pageTypesWithoutCsv.forEach(pt => console.log(`   - ${pt.pageType}: ${pt.countInDatabase} pages`));
    }
    
    console.log('\n==================================================');
    
  } catch (error) {
    console.error('Analysis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  }); 