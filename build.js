const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to clean the .next directory
function cleanNextDirectory() {
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    console.log('Cleaning .next directory...');
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
}

// Function to validate environment
function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const envFile = path.join(process.cwd(), `.env.${env}`);
  
  console.log(`Using environment: ${env}`);
  
  if (!fs.existsSync(envFile)) {
    console.error(`Error: ${envFile} not found`);
    process.exit(1);
  }
}

// Main build process
function build() {
  try {
    console.log('Starting build process...');
    
    // Clean .next directory
    cleanNextDirectory();

    // Validate environment
    validateEnvironment();
    
    // Run Next.js build
    console.log('Running Next.js build...');
    execSync('next build', { stdio: 'inherit' });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build(); 