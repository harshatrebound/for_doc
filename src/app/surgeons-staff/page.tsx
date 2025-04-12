'use client';

// import { Metadata } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import csv from 'csv-parser';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { StaffCard } from '@/app/surgeons-staff/components/StaffCard';
import { UserPlus, Users, Award, Phone, ArrowRight } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import { Readable } from 'stream';
import HeroSection from '@/components/ui/HeroSection';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/booking/BookingModal';
import { getStaffData } from './actions';

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

export default function SurgeonsStaffPage() {
  const [staffData, setStaffData] = useState<StaffMember[]>([]);
  const [processedStaff, setProcessedStaff] = useState<ProcessedStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    async function loadAndProcessData() {
      setIsLoading(true);
      const rawData = await getStaffData(); // Call server action
      setStaffData(rawData);

      // Process data client-side after fetching
      const processStaffMember = (staff: StaffMember): ProcessedStaff | null => {
        try {
          if (!staff.ContentBlocksJSON) return null;
          const contentBlocks = parseContentBlocks(staff.ContentBlocksJSON);
          if (!contentBlocks || contentBlocks.length === 0) return null;

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

      const processed = rawData
        .map(processStaffMember)
        .filter((staff): staff is ProcessedStaff => staff !== null);
      
      setProcessedStaff(processed);
      setIsLoading(false);
    }

    loadAndProcessData();
  }, []);

  // Categorization logic (runs on client after data processing)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader theme="transparent" />
      
      {/* Hero Section - Replaced with HeroSection component */}
      <HeroSection
        variant="image"
        height="large"
        bgColor="#2E3A59"
        bgImage="/images/team-hero.jpg" // Using the original team image
        title={ // Static title matching homepage style
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-[#8B5C9E]/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-[#8B5C9E]/30">
              OUR DEDICATED TEAM
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              <span className="block">Our Expert</span>
              <span className="block mt-2">Medical Team</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Meet the dedicated surgeons and healthcare professionals who provide exceptional orthopedic care.
            </p>
          </div>
        }
        actions={ // Actions matching homepage style
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
            <Button
              size="lg"
              className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
              onClick={() => setIsBookingModalOpen(true)}
              aria-label="Book an appointment with our specialists"
            >
              <span className="flex items-center justify-center">
                Request a Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 w-full sm:w-auto"
              aria-label="Meet Our Surgeons" 
            >
              <Link href="#surgeons" className="flex items-center">
                Meet Our Surgeons
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        }
      >
        {/* No children needed here */}
      </HeroSection>
      
      {/* Main Content - Existing structure with loading state */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        {isLoading ? (
           <div className="text-center py-16">Loading team information...</div>
        ) : (
          <>
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
          </>
        )}
      </main>
      
      <SiteFooter />

      {/* Booking Modal Added */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
} 