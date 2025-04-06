import { Metadata } from 'next';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { StaffCard } from '@/app/surgeons-staff/components/StaffCard';
import { UserPlus, Users, Award, Phone } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

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
    return JSON.parse(contentBlocksJSON);
  } catch (error: any) {
    console.error('Error parsing content blocks JSON:', error);
    return [];
  }
}

function extractImageUrl(contentBlocks: any[]): string {
  const imageBlock = contentBlocks.find(block => block.type === 'image');
  return imageBlock?.src || '/images/placeholder-staff.jpg';
}

function extractPosition(contentBlocks: any[]): string {
  const headingBlock = contentBlocks.find(block => 
    block.type === 'heading' && block.level === 3);
  return headingBlock?.text || '';
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>?/gm, '') || '';
}

function extractQualifications(contentBlocks: any[]): string {
  const paragraphBlock = contentBlocks.find(block => 
    block.type === 'paragraph' && 
    (block.text?.includes('MBBS') || 
     block.text?.includes('MS') || 
     block.text?.includes('MSc')));
  
  return stripHtml(paragraphBlock?.text || '');
}

async function getStaffData(): Promise<StaffMember[]> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), 'docs', 'surgeons_staff_cms.csv');
    const results: StaffMember[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: StaffMember) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

export default async function SurgeonsStaffPage() {
  const staffData = await getStaffData();

  const processStaffData = (staff: StaffMember): ProcessedStaff | null => {
    try {
      if (!staff.ContentBlocksJSON) return null;
      
      const contentBlocks = parseContentBlocks(staff.ContentBlocksJSON);
      const imageUrl = extractImageUrl(contentBlocks);
      const position = extractPosition(contentBlocks);
      const qualifications = extractQualifications(contentBlocks);
      const name = staff.Title.split('|')[0].trim();
      
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
      return null;
    }
  };

  // Process each staff member's data and filter out nulls
  const processedStaff = staffData
    .map(processStaffData)
    .filter((staff): staff is ProcessedStaff => staff !== null);

  // Group staff by categories
  const surgeons = processedStaff.filter(staff => 
    staff.position?.includes('Consultant') || 
    staff.position?.includes('Chief') || 
    staff.position?.includes('Dr.'));

  const specialists = processedStaff.filter(staff => 
    staff.position?.includes('Psychologist') || 
    staff.position?.includes('Physiotherapist') || 
    staff.position?.includes('MPT') ||
    staff.position?.includes('Therapist'));

  const supportStaff = processedStaff.filter(staff => 
    !surgeons.includes(staff) && 
    !specialists.includes(staff));

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
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
        
        <div className="relative z-10 container mx-auto px-4">
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