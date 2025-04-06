import { MetadataRoute } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import Papa from 'papaparse';

// Base URL for the site
const BASE_URL = 'https://fordoc-production.up.railway.app';

// Get all bone-joint-school topics from CSV
async function getBoneJointTopics(): Promise<string[]> {
  try {
    const csvFilePath = path.join(process.cwd(), 'docs', 'bone_joint_school_cms.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    return parsedCsv.data
      .filter(row => row.Slug && row.PageType === 'bone-joint-school')
      .map(row => row.Slug);
  } catch (error) {
    console.error("Error reading bone_joint_school_cms.csv:", error);
    return [];
  }
}

// Get all procedures from CSV
async function getProcedures(): Promise<string[]> {
  try {
    const csvFilePath = path.join(process.cwd(), 'docs', 'procedure_cms.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    return parsedCsv.data
      .filter(row => row.Slug && row.PageType === 'procedure')
      .map(row => row.Slug);
  } catch (error) {
    console.error("Error reading procedure_cms.csv:", error);
    return [];
  }
}

// Get all publications from CSV
async function getPublications(): Promise<string[]> {
  try {
    const csvFilePath = path.join(process.cwd(), 'docs', 'publication_cms.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    return parsedCsv.data
      .filter(row => row.Slug && row.PageType === 'publication' && row.Slug !== 'publication')
      .map(row => row.Slug);
  } catch (error) {
    console.error("Error reading publication_cms.csv:", error);
    return [];
  }
}

// Get all staff/surgeon profiles from CSV
async function getStaffProfiles(): Promise<string[]> {
  try {
    const csvFilePath = path.join(process.cwd(), 'docs', 'surgeons_staff_cms.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    return parsedCsv.data
      .filter(row => row.Slug && row.PageType === 'surgeon-staff')
      .map(row => row.Slug);
  } catch (error) {
    console.error("Error reading surgeons_staff_cms.csv:", error);
    return [];
  }
}

// Get all blog posts from CSV
async function getBlogPosts(): Promise<string[]> {
  try {
    const csvFilePath = path.join(process.cwd(), 'docs', 'blog_cms.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    return parsedCsv.data
      .filter(row => row.Slug && row.PageType === 'blog')
      .map(row => row.Slug);
  } catch (error) {
    console.error("Error reading blog_cms.csv:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/procedure-surgery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bone-joint-school`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/surgeons-staff`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/publications`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/clinical-videos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Fetch dynamic routes
  const [procedures, boneJointTopics, publications, staffProfiles, blogPosts] = await Promise.all([
    getProcedures(),
    getBoneJointTopics(),
    getPublications(),
    getStaffProfiles(),
    getBlogPosts(),
  ]);

  // Dynamic routes with their priorities
  const procedureRoutes = procedures.map(slug => ({
    url: `${BASE_URL}/procedure-surgery/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const boneJointRoutes = boneJointTopics.map(slug => ({
    url: `${BASE_URL}/bone-joint-school/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const publicationRoutes = publications.map(slug => ({
    url: `${BASE_URL}/publications/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staffRoutes = staffProfiles.map(slug => ({
    url: `${BASE_URL}/surgeons-staff/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const blogRoutes = blogPosts.map(slug => ({
    url: `${BASE_URL}/blogs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Combine all routes
  return [
    ...staticRoutes,
    ...procedureRoutes,
    ...boneJointRoutes,
    ...publicationRoutes,
    ...staffRoutes,
    ...blogRoutes,
  ];
} 