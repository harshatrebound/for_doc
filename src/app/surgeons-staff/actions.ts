'use server';

import path from 'path';
import { promises as fs } from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Interface moved from page.tsx
interface StaffMember {
  Slug: string;
  PageType: string;
  Title: string;
  OriginalURL: string;
  FeaturedImageURL: string;
  StaffName: string;
  StaffPosition: string;
  Specializations: string;
  Qualifications: string;
  ContactInfo: string;
  BreadcrumbJSON: string;
  ContentBlocksJSON: string;
}

// Function moved from page.tsx
export async function getStaffData(): Promise<StaffMember[]> {
  try {
    const filePath = path.join(process.cwd(), 'docs', 'surgeons_staff_cms.csv');
    
    try {
      await fs.stat(filePath);
    } catch (error) {
      console.error(`CSV file not found at ${filePath}`);
      return [];
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    console.log('CSV file content preview:', fileContent.slice(0, 200) + '...');

    return new Promise((resolve, reject) => {
      const results: StaffMember[] = [];
      const stream = Readable.from(fileContent);
      
      stream
        .pipe(csv())
        .on('data', (data: StaffMember) => {
          if (data.Slug && data.Title) {
            results.push(data);
          } else {
            console.warn('Skipping invalid staff data row:', data);
          }
        })
        .on('end', () => {
          console.log(`Successfully parsed ${results.length} staff members from CSV`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error reading staff data:', error);
    return [];
  }
} 