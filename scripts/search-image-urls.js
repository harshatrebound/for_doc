const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to read all files in a directory recursively
function* walkSync(dir, progressCallback) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      // Skip directories we know won't have relevant images
      if (file.isDirectory()) {
        if (
          file.name !== 'node_modules' && 
          file.name !== '.git' && 
          file.name !== '.next' &&
          file.name !== '.vscode' &&
          !file.name.includes('dist') &&
          !file.name.includes('build')
        ) {
          progressCallback(`Scanning directory: ${fullPath}`);
          yield* walkSync(fullPath, progressCallback);
        }
      } else {
        yield fullPath;
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Function to identify text-based files that might contain URLs
function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', 
    '.md', '.json', '.yml', '.yaml', '.txt', '.csv'
  ];
  return textExtensions.includes(ext);
}

// Function to search for URLs in a file
function findUrlsInFile(filePath) {
  try {
    if (!isTextFile(filePath)) return [];
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Regex patterns to find image URLs
    const patterns = [
      // Standard HTTP/HTTPS image URLs
      /(https?:\/\/[^\s"'<>()]+(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.svg)(\?[^\s"'<>()]+)?)/gi,
      
      // Specific for sportsorthopedics.in
      /(https?:\/\/[^\s"'<>()]*sportsorthopedics\.in[^\s"'<>()]*)/gi
    ];
    
    const results = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        results.push({
          url: match[1],
          file: filePath
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

// Main function
async function main() {
  console.log('Searching for image URLs in codebase...');
  
  const allUrls = [];
  const sportsUrls = [];
  let filesScanned = 0;
  let lastProgressUpdate = Date.now();
  
  // Instead of scanning everything, focus on these directories
  const dirsToScan = ['src', 'public', 'components', 'pages', 'app'];
  
  // Option 1: Manual traversal
  try {
    console.log('Scanning files in key directories...');
    
    for (const baseDir of dirsToScan) {
      const dirPath = path.join(process.cwd(), baseDir);
      
      if (fs.existsSync(dirPath)) {
        console.log(`\nScanning directory: ${baseDir}`);
        
        for (const filePath of walkSync(dirPath, (msg) => {
          // Only update progress every second
          if (Date.now() - lastProgressUpdate > 1000) {
            process.stdout.write(`\r${msg} (${filesScanned} files scanned)`);
            lastProgressUpdate = Date.now();
          }
        })) {
          filesScanned++;
          
          // For text files, look for URLs
          if (isTextFile(filePath)) {
            const urls = findUrlsInFile(filePath);
            if (urls.length > 0) {
              process.stdout.write(`\rFound ${urls.length} URLs in ${filePath}`);
              allUrls.push(...urls);
              
              // Check for sportsorthopedics URLs
              const sportsSpecific = urls.filter(item => 
                item.url.includes('sportsorthopedics.in')
              );
              if (sportsSpecific.length > 0) {
                console.log(`\n🎯 Found ${sportsSpecific.length} sportsorthopedics URLs in ${filePath}`);
                sportsUrls.push(...sportsSpecific);
              }
            }
          }
          
          // Show progress every 100 files
          if (filesScanned % 100 === 0) {
            process.stdout.write(`\rScanned ${filesScanned} files, found ${allUrls.length} URLs so far...`);
          }
        }
      } else {
        console.log(`Directory ${baseDir} does not exist, skipping.`);
      }
    }
    
    process.stdout.write(`\rCompleted scanning ${filesScanned} files.\n`);
  } catch (error) {
    console.error('\nError scanning files:', error);
  }
  
  // Option 2: Using command line tools as backup
  try {
    console.log('\nUsing command line search as backup...');
    // Search specifically for sportsorthopedics
    const cmd = process.platform === 'win32'
      ? 'findstr /r /s /i /m "sportsorthopedics.in" *.js *.jsx *.ts *.tsx *.css *.html'
      : 'grep -r --include="*.{js,jsx,ts,tsx,css,html}" "sportsorthopedics.in" .';
    
    console.log(`Running command: ${cmd}`);
    try {
      const result = execSync(cmd, { encoding: 'utf8' });
      console.log('Command line results:');
      console.log(result);
    } catch (e) {
      console.log('No results from command line search');
    }
  } catch (e) {
    console.log('Error in command line search:', e.message);
  }
  
  // Output results
  console.log('\n=== RESULTS ===');
  console.log(`Found ${allUrls.length} total image URLs in codebase`);
  console.log(`Found ${sportsUrls.length} sportsorthopedics.in URLs`);
  
  if (allUrls.length > 0) {
    console.log('\nAll image URLs:');
    const urlsByFile = {};
    
    allUrls.forEach(item => {
      if (!urlsByFile[item.file]) {
        urlsByFile[item.file] = [];
      }
      if (!urlsByFile[item.file].includes(item.url)) {
        urlsByFile[item.file].push(item.url);
      }
    });
    
    for (const [file, urls] of Object.entries(urlsByFile)) {
      console.log(`\nFile: ${file}`);
      urls.forEach(url => console.log(`  ${url}`));
    }
  }
  
  if (sportsUrls.length > 0) {
    console.log('\nsportsorthopedics.in URLs:');
    sportsUrls.forEach(item => {
      console.log(`${item.url}`);
      console.log(`  in file: ${item.file}`);
    });
  }
  
  // Save results to a file
  const report = {
    timestamp: new Date().toISOString(),
    totalUrls: allUrls.length,
    sportsorthopedicsUrls: sportsUrls.length,
    allUrls: allUrls.map(item => ({ url: item.url, file: item.file })),
    sportsUrls: sportsUrls.map(item => ({ url: item.url, file: item.file }))
  };
  
  fs.writeFileSync('image-urls-report.json', JSON.stringify(report, null, 2));
  console.log('\nDetailed report saved to: image-urls-report.json');
}

main(); 