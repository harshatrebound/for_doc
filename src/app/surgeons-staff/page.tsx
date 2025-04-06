import { Metadata } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import csv from 'csv-parser';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { StaffCard } from '@/app/surgeons-staff/components/StaffCard';
import { UserPlus, Users, Award, Phone } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import { Readable } from 'stream';

export const metadata: Metadata = {
  title: 'Surgeons & Staff | Sports Orthopedics',
  description: 'Meet our team of experienced surgeons and staff at Sports Orthopedics. We provide exceptional orthopedic care with a focus on sports injuries.',
  openGraph: {
    title: 'Surgeons & Staff | Sports Orthopedics',
    description: 'Meet our expert team of orthopedic surgeons and supporting staff.',
    images: ['/images/team-hero.jpg'],
  }
};

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

// Define a clear type for processed staff
interface ProcessedStaff {
  slug: string;
  name: string;
  position: string;
  qualifications: string;
  imageUrl: string;
  contactInfo: string;
  contentBlocks: any[];
}

function parseContentBlocks(contentBlocksJSON: string): any[] {
  try {
    if (!contentBlocksJSON) {
      console.warn('ContentBlocksJSON is empty');
      return [];
    }

    // Clean up the JSON string
    const cleanedJSON = contentBlocksJSON.trim();
    if (cleanedJSON === '[]' || cleanedJSON === '') {
      console.warn('ContentBlocksJSON is an empty array or empty string');
      return [];
    }

    // Try to parse the JSON
    const parsed = JSON.parse(cleanedJSON);
    if (!Array.isArray(parsed)) {
      console.error('ContentBlocksJSON did not parse to an array:', parsed);
      return [];
    }

    return parsed;
  } catch (error: any) {
    console.error('Error parsing content blocks JSON:', error.message);
    console.error('ContentBlocksJSON string:', contentBlocksJSON?.substring(0, 200) + '...');
    return [];
  }
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '') || '';
}

function extractImageUrl(contentBlocks: any[]): string {
  const imageBlock = contentBlocks.find(block => block.type === 'image');
  return imageBlock?.src || '/images/placeholder-staff.jpg';
}

function extractPosition(contentBlocks: any[]): string {
  const positionBlock = contentBlocks.find(block => 
    (block.type === 'heading' && block.level === 3) ||
    (block.type === 'paragraph' && block.text?.includes('Consultant'))
  );
  return stripHtml(positionBlock?.text || '');
}

function extractQualifications(contentBlocks: any[]): string {
  const qualBlock = contentBlocks.find(block => 
    block.type === 'paragraph' && 
    (block.text?.includes('MBBS') || 
     block.text?.includes('MS') || 
     block.text?.includes('MSc') ||
     block.text?.includes('DNB')));
  
  return stripHtml(qualBlock?.text || '');
}

async function getStaffData(): Promise<StaffMember[]> {
  try {
    const filePath = path.join(process.cwd(), 'docs', 'surgeons_staff_cms.csv');
    
    // Check if file exists
    try {
      await fs.stat(filePath);
    } catch (error) {
      console.error(`CSV file not found at ${filePath}`);
      return [];
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Log the first few characters of the file content for debugging
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

export default async function SurgeonsStaffPage() {
  const staffData = await getStaffData();

  const processStaffData = (staff: StaffMember): ProcessedStaff | null => {
    try {
      if (!staff.ContentBlocksJSON) {
        console.warn(`No ContentBlocksJSON for staff member ${staff.Slug}`);
        return null;
      }
      
      const contentBlocks = parseContentBlocks(staff.ContentBlocksJSON);
      if (!contentBlocks || contentBlocks.length === 0) {
        console.warn(`No valid content blocks for staff member ${staff.Slug}`);
        return null;
      }

      const imageUrl = extractImageUrl(contentBlocks);
      const position = extractPosition(contentBlocks);
      const qualifications = extractQualifications(contentBlocks);
      const name = staff.Title.split('|')[0].trim();
      
      // Log the processed data for debugging
      console.log(`Processed staff member ${staff.Slug}:`, {
        name,
        position,
        qualifications,
        imageUrl: imageUrl.substring(0, 50) + '...',
        hasContentBlocks: contentBlocks.length
      });
      
      return {
        slug: staff.Slug,
        name,
        position,
        qualifications,
        imageUrl,
        contactInfo: staff.ContactInfo,
        contentBlocks
      };
    } catch (error) {
      console.error(`Error processing staff member ${staff.Slug}:`, error);
      console.error('Staff data:', JSON.stringify(staff, null, 2));
      return null;
    }
  };

  // Process each staff member's data and filter out nulls
  const processedStaff = staffData
    .map(processStaffData)
    .filter((staff): staff is ProcessedStaff => staff !== null);

  // Log the number of staff members processed
  console.log(`Processed ${processedStaff.length} staff members out of ${staffData.length} total`);

  // Group staff by categories
  const surgeons = processedStaff.filter(staff => 
    staff.position?.toLowerCase().includes('consultant') || 
    staff.position?.toLowerCase().includes('chief') || 
    staff.position?.toLowerCase().includes('dr.'));

  const specialists = processedStaff.filter(staff => 
    staff.position?.toLowerCase().includes('psychologist') || 
    staff.position?.toLowerCase().includes('physiotherapist') || 
    staff.position?.toLowerCase().includes('mpt') ||
    staff.position?.toLowerCase().includes('therapist'));

  const supportStaff = processedStaff.filter(staff => 
    !surgeons.includes(staff) && 
    !specialists.includes(staff));

  // Log the categorization results
  console.log('Staff categorization:', {
    surgeons: surgeons.length,
    specialists: specialists.length,
    supportStaff: supportStaff.length
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <Image 
            src="/images/team-hero.jpg" 
            alt="Our Medical Team"
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#8B5C9E]/60 via-[#8B5C9E]/70 to-[#8B5C9E]/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 pt-24 md:pt-32">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            <span className="relative inline-block">
              Our Expert
              <div className="absolute -inset-1 bg-[#8B5C9E]/20 blur-xl animate-pulse"></div>
            </span>
            <br />
            <span className="text-white">
              Medical Team
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Meet the dedicated surgeons and healthcare professionals who provide exceptional orthopedic care.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="#surgeons" 
              className="px-6 py-3 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white font-medium rounded-lg inline-flex items-center transition-colors"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Meet Our Surgeons
            </a>
            <BookingButton 
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg inline-flex items-center transition-colors backdrop-blur-sm"
              icon={<Phone className="w-5 h-5 mr-2" />}
              text="Book an Appointment"
            />
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Intro Section */}
        <div className="mb-12 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">World-Class Orthopedic Specialists</h2>
          <p className="text-gray-600">
            Our team of highly qualified surgeons and medical staff are committed to providing exceptional care 
            and innovative treatment options for all orthopedic conditions. With decades of combined experience 
            and specialized training, we offer personalized care tailored to your specific needs.
          </p>
        </div>
        
        {/* Surgeons Section */}
        {surgeons.length > 0 && (
          <section id="surgeons" className="mb-16">
            <div className="flex items-center mb-8">
              <Award className="w-6 h-6 text-[#8B5C9E] mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Orthopedic Surgeons</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {surgeons.map((staff) => (
                <StaffCard key={staff.slug} staff={staff} />
              ))}
            </div>
          </section>
        )}
        
        {/* Specialists Section */}
        {specialists.length > 0 && (
          <section id="specialists" className="mb-16">
            <div className="flex items-center mb-8">
              <UserPlus className="w-6 h-6 text-[#8B5C9E] mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Medical Specialists</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialists.map((staff) => (
                <StaffCard key={staff.slug} staff={staff} />
              ))}
            </div>
          </section>
        )}
        
        {/* Support Staff Section */}
        {supportStaff.length > 0 && (
          <section id="support-staff" className="mb-16">
            <div className="flex items-center mb-8">
              <Users className="w-6 h-6 text-[#8B5C9E] mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Support Team</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportStaff.map((staff) => (
                <StaffCard key={staff.slug} staff={staff} />
              ))}
            </div>
          </section>
        )}
        
        {/* Additional Info Section */}
        <section className="bg-white rounded-xl p-8 shadow-md mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Work With the Best in Orthopedic Care</h2>
          <div className="prose max-w-none">
            <p>
              At Sports Orthopedics, our medical team comprises internationally trained and experienced 
              specialists who have achieved excellence in their respective fields. Our surgeons have been 
              recognized with prestigious awards and have pioneered advanced techniques in orthopedic care.
            </p>
            <p>
              We believe in a collaborative approach to patient care, bringing together surgeons, specialists, 
              and support staff to develop comprehensive treatment plans tailored to each patient's unique needs.
            </p>
            <p>
              To schedule a consultation with any of our medical professionals, please 
              <a href="/contact" className="text-[#8B5C9E] hover:text-[#7a4f8a] mx-1">contact us</a>
              or call us directly at <strong>+91-6364538660</strong>.
            </p>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
} 