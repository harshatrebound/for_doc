const fs = require('fs');
const path = require('path');

// Path to .env file
const envPath = path.join(process.cwd(), '.env');

try {
  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    // Read the current content
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if ENABLE_CSV_FALLBACK is already set
    if (envContent.includes('ENABLE_CSV_FALLBACK=')) {
      // Toggle the value
      envContent = envContent.replace(
        /ENABLE_CSV_FALLBACK=(true|false)/,
        (match, currentValue) => `ENABLE_CSV_FALLBACK=${currentValue === 'true' ? 'false' : 'true'}`
      );
      
      console.log(`CSV fallback mode has been ${envContent.includes('ENABLE_CSV_FALLBACK=true') ? 'ENABLED' : 'DISABLED'}`);
    } else {
      // Add the variable
      envContent = envContent.trim() + '\n\n# Content system configuration\nENABLE_CSV_FALLBACK=true\n';
      console.log('CSV fallback mode has been ENABLED (added to .env)');
    }
    
    // Write the updated content back
    fs.writeFileSync(envPath, envContent);
  } else {
    // Create a new .env file with the fallback enabled
    const defaultContent = `# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bone_joint_db"

# Content system configuration
ENABLE_CSV_FALLBACK=true
`;
    fs.writeFileSync(envPath, defaultContent);
    console.log('Created new .env file with CSV fallback mode ENABLED');
  }
} catch (error) {
  console.error('Error updating .env file:', error);
} 