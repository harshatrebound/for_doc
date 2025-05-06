'use server';

import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Base CSV file path
const CSV_FILE_PATH = path.join(process.cwd(), 'docs', 'procedure_surgery_cms.csv');

// Type definitions
export interface ProcedureCategory {
  id: string;
  name: string;
  count: number;
  icon?: string;
  color?: string;
}

export interface Procedure {
  slug: string;
  title: string;
  categoryId: string;
  category: string;
  summary: string;
  imageUrl: string;
  procedureTime?: string;
  recoveryPeriod?: string;
  inpatient?: boolean;
  contentBlocks?: any;
  // Other properties like breadcrumbs can be added here if needed
}

// Helper function to safely parse JSON
function safeJsonParse<T>(jsonString?: string, fallback: T = {} as T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
}

// Helper function to replace &nbsp; with regular spaces in a string
function replaceNbsp(text?: string): string {
  if (!text) return '';
  return text.replace(/&nbsp;/g, ' ');
}

// Helper function to recursively replace &nbsp; in content blocks
function cleanContentBlocks(blocks: any[]): any[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(block => {
    const newBlock = { ...block };
    if (typeof newBlock.text === 'string') {
      newBlock.text = replaceNbsp(newBlock.text);
    }
    // If listItems exist and are strings, clean them too
    if (Array.isArray(newBlock.listItems)) {
      newBlock.listItems = newBlock.listItems.map((item: any) => {
        if (typeof item === 'string') {
          return replaceNbsp(item);
        }
        // If list items can be objects with text properties, handle them (example)
        if (typeof item === 'object' && item !== null && typeof item.text === 'string') {
          return { ...item, text: replaceNbsp(item.text) };
        }
        return item;
      });
    }
    // Add more recursive cleaning if other nested structures with text exist
    // For example, if blocks can have nested blocks:
    // if (Array.isArray(newBlock.blocks)) { // Assuming a 'blocks' property for nested blocks
    //   newBlock.blocks = cleanContentBlocks(newBlock.blocks);
    // }
    return newBlock;
  });
}

// Helper to extract first paragraph from content blocks for summary
function extractSummary(contentBlocks: any[]): string {
  if (!contentBlocks || contentBlocks.length === 0) return '';
  
  const firstPara = contentBlocks.find(block => block.type === 'paragraph');
  if (firstPara?.text) {
    // Strip HTML
    const plainText = firstPara.text.replace(/<[^>]*>?/gm, '');
    return plainText; // Return the full plain text without truncation
  }
  
  return '';
}

// Main function to get all procedures and categories
export async function getProceduresData(): Promise<{
  procedures: Procedure[];
  categories: ProcedureCategory[];
}> {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error('CSV Parsing errors:', parsedCsv.errors);
    }

    // Initialize category tracker
    const categoryMap = new Map<string, ProcedureCategory>();
    const procedures: Procedure[] = [];

    // Process each row from the CSV
    for (const row of parsedCsv.data) {
      // Only include rows that are procedure-surgery page type
      if (row.PageType === 'procedure-surgery' && row.Slug) {
        let rawContentBlocks = safeJsonParse<any[]>(row.ContentBlocksJSON, []);
        const contentBlocks = cleanContentBlocks(rawContentBlocks);
        
        // Clean up title (remove site name)
        const title = replaceNbsp((row.Title || '').split('|')[0].trim());
        
        // Get category from either CategoryJSON or custom CategoryID+CategoryName fields
        let categoryId = '';
        let categoryName = '';
        
        // Try to get category from CategoryJSON if available
        if (row.CategoryJSON) {
          const category = safeJsonParse<{ id: string; name: string }>(row.CategoryJSON);
          categoryId = category.id || '';
          categoryName = category.name || '';
        }
        
        // If CategoryJSON didn't provide values, try other fields
        if (!categoryId && row.CategoryID) {
          categoryId = row.CategoryID;
        }
        
        if (!categoryName && row.CategoryName) {
          categoryName = row.CategoryName;
        }
        
        // Default categories if still not found
        if (!categoryId) {
          // Try to derive from title or slug
          const slug = row.Slug.toLowerCase();
          if (slug.includes('knee')) {
            categoryId = 'knee';
            categoryName = 'Knee';
          } else if (slug.includes('shoulder')) {
            categoryId = 'shoulder';
            categoryName = 'Shoulder';
          } else if (slug.includes('elbow')) {
            categoryId = 'elbow';
            categoryName = 'Elbow';
          } else if (slug.includes('hip')) {
            categoryId = 'hip';
            categoryName = 'Hip';
          } else if (slug.includes('wrist') || slug.includes('hand')) {
            categoryId = 'hand_wrist';
            categoryName = 'Hand & Wrist';
          } else if (slug.includes('ankle') || slug.includes('foot')) {
            categoryId = 'foot_ankle';
            categoryName = 'Foot & Ankle';
          } else if (slug.includes('spine') || slug.includes('back')) {
            categoryId = 'spine';
            categoryName = 'Spine';
          } else {
            categoryId = 'other';
            categoryName = 'Other Procedures';
          }
        }
        
        // Track category
        if (categoryId && categoryName) {
          if (categoryMap.has(categoryId)) {
            const category = categoryMap.get(categoryId)!;
            category.count += 1;
          } else {
            categoryMap.set(categoryId, {
              id: categoryId,
              name: categoryName,
              count: 1,
              // Optional custom icon/color could be added here
            });
          }
        }
        
        // Get or create a summary
        let summary = replaceNbsp(row.Summary || '');
        if (!summary && contentBlocks.length > 0) {
          summary = replaceNbsp(extractSummary(contentBlocks));
        }
        
        // Create a procedure object
        const procedure: Procedure = {
          slug: row.Slug,
          title,
          categoryId,
          category: categoryName,
          summary,
          imageUrl: row.FeaturedImageURL || '',
          // Optional fields
          procedureTime: row.ProcedureTime,
          recoveryPeriod: row.RecoveryPeriod,
          inpatient: row.InpatientProcedure === 'true',
          contentBlocks,
        };
        
        procedures.push(procedure);
      }
    }

    // Convert category map to array and sort
    const categories = Array.from(categoryMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      procedures: procedures.sort((a, b) => a.title.localeCompare(b.title)),
      categories
    };
  } catch (error) {
    console.error('Error reading or parsing procedure_surgery_cms.csv:', error);
    return { procedures: [], categories: [] };
  }
}

// Function to get a single procedure by slug
export async function getProcedureBySlug(slug: string): Promise<Procedure | null> {
  const { procedures } = await getProceduresData();
  return procedures.find(p => p.slug === slug) || null;
}

// Function to get all procedures matching a category
export async function getProceduresByCategory(categoryId: string | null): Promise<Procedure[]> {
  const { procedures } = await getProceduresData();
  if (categoryId === null) {
    return procedures;
  }
  return procedures.filter(p => p.categoryId === categoryId);
} 