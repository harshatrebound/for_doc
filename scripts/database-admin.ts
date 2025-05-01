#!/usr/bin/env ts-node
/**
 * Database Admin CLI
 * 
 * Usage:
 *   npx ts-node scripts/database-admin.ts [command]
 * 
 * Commands:
 *   migrate-content   - Migrate CSV content to PostgreSQL database
 *   sync-content      - Sync changes from CSV to existing PostgreSQL content
 *   export-content    - Export database content to CSV
 *   health-check      - Check database connectivity and status
 *   toggle-fallback   - Toggle CSV fallback mode in environment
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenv.config();
const execAsync = promisify(exec);

// Create Prisma client
const prisma = new PrismaClient();

// Get command-line arguments
const [,, command, ...args] = process.argv;

// Helper functions
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

// Content file paths
const csvFiles = [
  { path: 'docs/bone_joint_school_cms.csv', pageType: 'bone-joint-school' },
  { path: 'docs/procedure_surgery_cms.csv', pageType: 'procedure-surgery' },
  { path: 'docs/post_cms.csv', pageType: 'post' },
];

// Helper to infer category from title
function inferCategory(title: string): string | null {
  if (!title) return null;
  
  const titleLower = title.toLowerCase();
  if (titleLower.includes('knee')) return 'Knee';
  if (titleLower.includes('hip')) return 'Hip';
  if (titleLower.includes('shoulder')) return 'Shoulder';
  if (titleLower.includes('elbow')) return 'Elbow';
  if (titleLower.includes('wrist') || titleLower.includes('hand')) return 'Hand & Wrist';
  if (titleLower.includes('ankle') || titleLower.includes('foot')) return 'Foot & Ankle';
  if (titleLower.includes('spine') || titleLower.includes('back')) return 'Spine';
  
  return null;
}

// Helper to get categories from the CSV
async function importCategories(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();
  
  try {
    const categoryFilePath = path.join(process.cwd(), 'docs', 'category_cms.csv');
    
    try {
      const fileContent = await fs.readFile(categoryFilePath, 'utf-8');
      const parsedCsv = Papa.parse<any>(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      console.log(`Importing categories...`);
      
      for (const row of parsedCsv.data) {
        if (!row.Name) continue;
        
        const categoryName = row.Name.trim();
        const categorySlug = row.Slug || categoryName.toLowerCase().replace(/\s+/g, '-');
        
        // Create or find the category
        const category = await prisma.category.upsert({
          where: { name: categoryName },
          update: {},
          create: {
            name: categoryName,
            slug: categorySlug,
            description: row.Description || null,
          },
        });
        
        // Store the category ID mapped to its name for later use
        categoryMap.set(categoryName, category.id);
      }
      
      console.log(`Imported ${categoryMap.size} categories.`);
    } catch (error) {
      console.log('No dedicated category CSV, inferring from content...');
      
      // If no category file, create common categories
      const commonCategories = [
        'Knee', 'Hip', 'Shoulder', 'Elbow', 'Hand & Wrist', 
        'Foot & Ankle', 'Spine', 'General', 'Other'
      ];
      
      for (const name of commonCategories) {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        
        const category = await prisma.category.upsert({
          where: { name },
          update: {},
          create: {
            name,
            slug,
            description: `Content related to ${name.toLowerCase()}`,
          },
        });
        
        categoryMap.set(name, category.id);
      }
      
      console.log(`Created ${categoryMap.size} default categories.`);
    }
    
    return categoryMap;
  } catch (error) {
    console.error('Error importing categories:', error);
    return new Map();
  }
}

// Function to import content from CSV files
async function importContent(categoryMap: Map<string, string>) {
  for (const csvFile of csvFiles) {
    try {
      const filePath = path.join(process.cwd(), csvFile.path);
      
      try {
        await fs.access(filePath);
      } catch {
        console.log(`File ${filePath} not found, skipping...`);
        continue;
      }
      
      console.log(`Processing file: ${filePath}`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsedCsv = Papa.parse<any>(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      console.log(`Found ${parsedCsv.data.length} rows in ${csvFile.path}`);
      
      // Process each row in the CSV
      for (let i = 0; i < parsedCsv.data.length; i++) {
        const row = parsedCsv.data[i];
        
        if (!row.Slug) {
          console.log(`Skipping row ${i + 1} due to missing slug`);
          continue;
        }
        
        const slug = row.Slug.trim();
        const pageType = row.PageType || csvFile.pageType;
        const title = (row.Title || slug).split('|')[0].trim();
        const featuredImageUrl = row.FeaturedImageURL || null;
        
        // Parse contentBlocks JSON
        const contentBlocksJson = safeJsonParse<any[]>(row.ContentBlocksJSON) || [];
        
        // Extract the first paragraph for summary
        let summary = 'No summary available.';
        const firstParagraph = contentBlocksJson.find(block => block.type === 'paragraph');
        if (firstParagraph && firstParagraph.text) {
          const plainText = stripHtml(firstParagraph.text);
          summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        }
        
        // Determine category
        let categoryId = null;
        let category = row.Category || '';
        if (!category) {
          // Try to infer category from title if not specified
          const inferredCategory = inferCategory(title);
          if (inferredCategory) {
            category = inferredCategory;
          }
        }
        
        if (category && categoryMap.has(category)) {
          categoryId = categoryMap.get(category) || null;
        }
        
        // Calculate approximate reading time
        const totalText = contentBlocksJson
          .map(block => stripHtml(block.text || ''))
          .join(' ');
        const wordCount = totalText.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
        
        // Parse publication date
        let publishedAt = new Date();
        if (row.ScrapedAt) {
          publishedAt = new Date(row.ScrapedAt);
        } else if (row.PublishDate) {
          publishedAt = new Date(row.PublishDate);
        }
        
        // Create the page record
        const page = await prisma.page.upsert({
          where: { slug },
          update: {
            title,
            featuredImageUrl,
            summary,
            categoryId,
            readingTime,
            updatedAt: new Date(),
          },
          create: {
            slug,
            pageType,
            title,
            featuredImageUrl,
            summary,
            categoryId,
            readingTime,
            publishedAt,
          },
        });
        
        // Delete existing content blocks for this page (for updates)
        await prisma.contentBlock.deleteMany({
          where: { pageId: page.id },
        });
        
        // Create content blocks
        for (let j = 0; j < contentBlocksJson.length; j++) {
          const block = contentBlocksJson[j];
          
          await prisma.contentBlock.create({
            data: {
              pageId: page.id,
              type: block.type || 'paragraph',
              level: block.level || null,
              text: block.text || '',
              icon: block.icon || null,
              sortOrder: j,
            },
          });
        }
        
        console.log(`Processed page: ${slug}`);
      }
      
      console.log(`Completed processing file: ${csvFile.path}`);
    } catch (error) {
      console.error(`Error processing ${csvFile.path}:`, error);
    }
  }
}

// Migrate content from CSV to DB
async function migrateContent() {
  try {
    console.log('Starting content migration to PostgreSQL...');
    
    // First import categories
    const categoryMap = await importCategories();
    
    // Then import content
    await importContent(categoryMap);
    
    console.log('Content migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Check database health
async function checkDatabaseHealth() {
  try {
    console.log('Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection is healthy.');
    
    // Get counts of key tables
    const doctorCount = await prisma.doctor.count();
    const appointmentCount = await prisma.appointment.count();
    const pageCount = await prisma.page.count();
    const categoryCount = await prisma.category.count();
    
    console.log('Database statistics:');
    console.log(`- Doctors: ${doctorCount}`);
    console.log(`- Appointments: ${appointmentCount}`);
    console.log(`- Content pages: ${pageCount}`);
    console.log(`- Categories: ${categoryCount}`);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export content to CSV
async function exportContent() {
  console.log('Exporting content to CSV...');
  
  const exportDir = path.join(process.cwd(), 'exports');
  
  try {
    await fs.mkdir(exportDir, { recursive: true });
  } catch (err) {
    console.error('Error creating export directory:', err);
    return;
  }
  
  try {
    // Export categories
    const categories = await prisma.category.findMany();
    const categoryData = categories.map((cat: { name: string; slug: string; description: string | null }) => ({
      Name: cat.name,
      Slug: cat.slug,
      Description: cat.description || '',
    }));
    
    const categoryFile = path.join(exportDir, 'categories_export.csv');
    await fs.writeFile(categoryFile, Papa.unparse(categoryData));
    console.log(`Exported ${categories.length} categories to ${categoryFile}`);
    
    // Export content by page type
    const pageTypes = await prisma.page.findMany({
      select: { pageType: true },
      distinct: ['pageType'],
    });
    
    for (const { pageType } of pageTypes) {
      const pages = await prisma.page.findMany({
        where: { pageType },
        include: {
          contentBlocks: { orderBy: { sortOrder: 'asc' } },
          category: true,
        },
      });
      
      const pagesData = pages.map((page: any) => {
        const contentBlocksJSON = JSON.stringify(
          page.contentBlocks.map((block: { type: string; level: number | null; text: string; icon: string | null }) => ({
            type: block.type,
            level: block.level,
            text: block.text,
            icon: block.icon,
          }))
        );
        
        return {
          Slug: page.slug,
          Title: page.title,
          FeaturedImageURL: page.featuredImageUrl || '',
          PageType: page.pageType,
          Category: page.category?.name || '',
          ContentBlocksJSON: contentBlocksJSON,
          Summary: page.summary || '',
          PublishDate: page.publishedAt ? page.publishedAt.toISOString().split('T')[0] : '',
          ReadingTime: page.readingTime || '',
        };
      });
      
      const pageTypeFile = path.join(exportDir, `${pageType.replace(/-/g, '_')}_export.csv`);
      await fs.writeFile(pageTypeFile, Papa.unparse(pagesData));
      console.log(`Exported ${pages.length} ${pageType} pages to ${pageTypeFile}`);
    }
    
    console.log('Content export completed successfully.');
  } catch (error) {
    console.error('Error exporting content:', error);
  }
}

// Toggle CSV fallback mode
async function toggleFallbackMode() {
  try {
    const envFile = path.join(process.cwd(), '.env');
    const envContent = await fs.readFile(envFile, 'utf-8');
    
    // Check if ENABLE_CSV_FALLBACK is present
    const fallbackVarPresent = envContent.includes('ENABLE_CSV_FALLBACK=');
    
    if (fallbackVarPresent) {
      // Toggle existing value
      const newContent = envContent.replace(
        /ENABLE_CSV_FALLBACK=(true|false)/,
        (match, currentValue) => `ENABLE_CSV_FALLBACK=${currentValue === 'true' ? 'false' : 'true'}`
      );
      
      await fs.writeFile(envFile, newContent);
      
      const newValue = newContent.match(/ENABLE_CSV_FALLBACK=(true|false)/)?.[1];
      console.log(`CSV fallback mode has been ${newValue === 'true' ? 'ENABLED' : 'DISABLED'}`);
    } else {
      // Add new entry
      const newContent = envContent.trim() + '\n\n# Content system configuration\nENABLE_CSV_FALLBACK=true\n';
      await fs.writeFile(envFile, newContent);
      console.log('CSV fallback mode has been ENABLED (added to .env)');
    }
  } catch (error) {
    console.error('Error toggling fallback mode:', error);
  }
}

// Main execution
async function main() {
  try {
    switch (command) {
      case 'migrate-content':
        await migrateContent();
        break;
      
      case 'sync-content':
        console.log('This will update the database with the latest changes from CSV files.');
        await migrateContent(); // Uses upsert, so works for syncing too
        break;
      
      case 'export-content':
        await exportContent();
        break;
      
      case 'health-check':
        await checkDatabaseHealth();
        break;
      
      case 'toggle-fallback':
        await toggleFallbackMode();
        break;
      
      default:
        console.log(`
Database Admin CLI

Usage:
  npx ts-node scripts/database-admin.ts [command]

Commands:
  migrate-content   - Migrate CSV content to PostgreSQL database
  sync-content      - Sync changes from CSV to existing PostgreSQL content
  export-content    - Export database content to CSV
  health-check      - Check database connectivity and status
  toggle-fallback   - Toggle CSV fallback mode in environment
        `);
    }
  } catch (error) {
    console.error('Error in command execution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main(); 