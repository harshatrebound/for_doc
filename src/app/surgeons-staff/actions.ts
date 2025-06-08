'use server';

import { 
  getStaffMembers, 
  getStaffCategories, 
  searchStaffMembers, 
  getFeaturedStaffMembers,
  debugStaffData
} from '@/lib/directus';
import { StaffMember, StaffFilters, StaffActionResponse } from '@/types/staff';

export async function getStaffWithFilters(
  filters: StaffFilters = {}
): Promise<StaffActionResponse> {
  const { category, search, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;

  try {
    // Fetch staff and categories in parallel
    const [staffResponse, categories] = await Promise.all([
      getStaffMembers(limit, offset, category, search),
      getStaffCategories()
    ]);

    return {
      staff: staffResponse.data,
      total: staffResponse.total,
      page: staffResponse.page,
      totalPages: staffResponse.totalPages,
      categories
    };
  } catch (error) {
    console.error('Error in getStaffWithFilters:', error);
    return {
      staff: [],
      total: 0,
      page: 1,
      totalPages: 0,
      categories: ['All']
    };
  }
}

export async function searchStaffAction(
  searchTerm: string,
  limit = 10
): Promise<StaffMember[]> {
  try {
    return await searchStaffMembers(searchTerm, limit);
  } catch (error) {
    console.error('Error in searchStaffAction:', error);
    return [];
  }
}

export async function getFeaturedStaffAction(
  limit = 6
): Promise<StaffMember[]> {
  try {
    return await getFeaturedStaffMembers(limit);
  } catch (error) {
    console.error('Error in getFeaturedStaffAction:', error);
    return [];
  }
}

export async function getStaffCategoriesAction(): Promise<string[]> {
  try {
    return await getStaffCategories();
  } catch (error) {
    console.error('Error in getStaffCategoriesAction:', error);
    return ['All'];
  }
}

// Get individual staff member by slug
export async function getStaffMemberBySlugAction(slug: string): Promise<StaffMember | null> {
  try {
    const { getStaffMemberBySlug } = await import('@/lib/directus');
    return await getStaffMemberBySlug(slug);
  } catch (error) {
    console.error('Error in getStaffMemberBySlugAction:', error);
    return null;
  }
}

// Get related staff members for a staff member page
export async function getRelatedStaffAction(
  currentId: string, 
  category?: string, 
  limit = 3
): Promise<StaffMember[]> {
  try {
    const { getRelatedStaffMembers } = await import('@/lib/directus');
    return await getRelatedStaffMembers(currentId, category, limit);
  } catch (error) {
    console.error('Error in getRelatedStaffAction:', error);
    return [];
  }
}

// Debug action for testing Directus integration
export async function debugStaffAction(): Promise<any> {
  try {
    return await debugStaffData();
  } catch (error) {
    console.error('Error in debugStaffAction:', error);
    return { error: 'Failed to debug staff data' };
  }
}

// Legacy CSV function - kept as fallback
import path from 'path';
import { promises as fs } from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';

// Legacy interface for CSV data
interface LegacyStaffMember {
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

// Legacy function for CSV fallback
export async function getStaffDataLegacy(): Promise<LegacyStaffMember[]> {
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
      const results: LegacyStaffMember[] = [];
      const stream = Readable.from(fileContent);
      
      stream
        .pipe(csv())
        .on('data', (data: LegacyStaffMember) => {
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