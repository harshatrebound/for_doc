const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to search for Unsplash URLs in a file
function searchFileForUnsplashUrls(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Search for unsplash URLs
    const matches = content.match(/https?:\/\/[^\s"']+unsplash[^\s"']+/g) || [];
    
    if (matches.length > 0) {
      console.log(`\nFound ${matches.length} Unsplash URLs in ${filePath}:`);
      matches.forEach(url => console.log(`  * ${url}`));
      return { file: filePath, urls: matches };
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return null;
  }
}

// Main function
function searchUnsplashUrls() {
  console.log('Searching for Unsplash URLs in codebase...');
  
  // Define file patterns to search
  const filePatterns = [
    'app/**/*.{js,jsx,ts,tsx,html,css}',
    'components/**/*.{js,jsx,ts,tsx,html,css}',
    'pages/**/*.{js,jsx,ts,tsx,html,css}',
    'public/**/*.{js,jsx,ts,tsx,html,css,json}',
    'styles/**/*.{css,scss}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'prisma/**/*.{js,ts}',
    'scripts/**/*.js',
    '*.{js,jsx,ts,tsx,json}'
  ];
  
  // Get all matching files
  const allFiles = [];
  filePatterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: ['node_modules/**', '**/dist/**', '**/build/**'] });
    allFiles.push(...files);
  });
  
  console.log(`Found ${allFiles.length} files to search.`);
  
  // Search each file
  const results = [];
  let totalUrls = 0;
  
  allFiles.forEach(file => {
    const result = searchFileForUnsplashUrls(file);
    if (result) {
      results.push(result);
      totalUrls += result.urls.length;
    }
  });
  
  // Print summary
  console.log('\n===== SUMMARY =====');
  console.log(`Found ${totalUrls} Unsplash URLs in ${results.length} files.`);
  
  // Save the results to a file
  if (results.length > 0) {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: allFiles.length,
      filesWithUnsplashUrls: results.length,
      totalUnsplashUrls: totalUrls,
      files: results.map(r => ({ 
        file: r.file, 
        urlCount: r.urls.length,
        urls: r.urls 
      }))
    };
    
    fs.writeFileSync('unsplash-urls-report.json', JSON.stringify(report, null, 2));
    console.log('\nDetailed report saved to unsplash-urls-report.json');
  }
}

searchUnsplashUrls(); 