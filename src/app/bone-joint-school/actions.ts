'use server';

import path from 'path';
import { promises as fs } from 'fs';
import Papa from 'papaparse';

// Define the structure for our topic data based on CSV columns
interface BoneJointTopic {
  slug: string;
  title: string;
  imageUrl: string;
  summary: string;
  category?: string; 
}

// Helper to safely parse JSON from CSV, returning null on error
// NOTE: Keep these helpers (safeJsonParse, stripHtml) in page.tsx or move to utils
// if they are needed on the client, as they don't use server modules.
// For simplicity, we assume they are available where needed or redefined/imported in page.tsx
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return null;
  }
}

// Helper to strip HTML tags for a plain text summary
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Enhanced function to get topics from the main CSV with categories
export async function getBoneJointTopics(): Promise<{
  topics: BoneJointTopic[],
  categories: string[]
}> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'bone_joint_school_cms.csv');
  const topics: BoneJointTopic[] = [];
  const categoriesSet = new Set<string>(['All']);

  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedCsv.errors);
    }

    for (const row of parsedCsv.data) {
      if (row.Slug && row.PageType === 'bone-joint-school') {
        const slug = row.Slug;
        const title = (row.Title || slug).split('|')[0].trim();
        const imageUrl = row.FeaturedImageURL || '/images_bone_joint/doctor-holding-tablet-e-health-concept-business-concept.webp'; 
        
        let category = row.Category || '';
        if (!category) {
          const titleLower = title.toLowerCase();
          if (titleLower.includes('knee')) category = 'Knee';
          else if (titleLower.includes('hip')) category = 'Hip';
          else if (titleLower.includes('shoulder')) category = 'Shoulder';
          else if (titleLower.includes('elbow')) category = 'Elbow';
          else if (titleLower.includes('wrist') || titleLower.includes('hand')) category = 'Hand & Wrist';
          else if (titleLower.includes('ankle') || titleLower.includes('foot')) category = 'Foot & Ankle';
          else if (titleLower.includes('spine') || titleLower.includes('back')) category = 'Spine';
          else category = 'General';
        }
        
        if (category) {
          categoriesSet.add(category);
        }

        let summary = 'No summary available.';
        const contentBlocks = safeJsonParse<{type: string, text: string}[]>(row.ContentBlocksJSON);
        if (contentBlocks) {
          const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
          if (firstParagraph && firstParagraph.text) {
            const plainText = stripHtml(firstParagraph.text);
            summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
          }
        }

        topics.push({ 
          slug, 
          title, 
          imageUrl, 
          summary,
          category 
        });
      }
    }
  } catch (error) {
    console.error("Error reading or parsing bone_joint_school_cms.csv:", error);
    return { topics: [], categories: [] }; 
  }

  topics.sort((a, b) => a.title.localeCompare(b.title));
  return { 
    topics, 
    categories: Array.from(categoriesSet)
  };
} 