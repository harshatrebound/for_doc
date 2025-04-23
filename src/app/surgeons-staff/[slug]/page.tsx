import { Metadata } from 'next';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import Image from 'next/image';
import React from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Award, BookOpen, Briefcase, GraduationCap, Medal, User, FileText, Building, Users, Stethoscope, Globe, Bookmark, Heart, Phone } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import BookingButton from '@/components/BookingButton';
import DoctorDataSection from './components/DoctorDataSection';
import { StaffHero } from './components/StaffHero';

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

interface ContentBlock {
  type: string;
  level?: number;
  text?: string;
  src?: string;
  alt?: string;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const staffMember = await getStaffMemberBySlug(params.slug);
  
  if (!staffMember) {
    return {
      title: 'Staff Member Not Found',
    };
  }

  const name = staffMember.Title.split('|')[0].trim();
  
  return {
    title: `${name} | Sports Orthopedics`,
    description: `Learn more about ${name}, a member of our professional team at Sports Orthopedics.`,
  };
}

async function getStaffMemberBySlug(slug: string): Promise<StaffMember | null> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(process.cwd(), 'docs', 'surgeons_staff_cms.csv');
    let foundStaff: StaffMember | null = null;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: StaffMember) => {
        if (data.Slug === slug) {
          foundStaff = data;
        }
      })
      .on('end', () => resolve(foundStaff))
      .on('error', (error: any) => reject(error));
  });
}

function extractImageUrl(contentBlocks: ContentBlock[]): string {
  const imageBlock = contentBlocks.find(block => block.type === 'image');
  return imageBlock?.src || '/placeholder-staff.jpg';
}

function parseContentBlocks(contentBlocksJSON: string): ContentBlock[] {
  try {
    return JSON.parse(contentBlocksJSON);
  } catch (error: any) {
    console.error('Error parsing content blocks JSON:', error);
    return [];
  }
}

function extractQualifications(contentBlocks: ContentBlock[]): string {
  const paragraphBlock = contentBlocks.find(block => 
    block.type === 'paragraph' && 
    (block.text?.includes('MBBS') ||
    block.text?.includes('MS') ||
    block.text?.includes('MSc')));
  
  return paragraphBlock?.text?.replace(/<[^>]*>/g, '') || '';
}

function extractPosition(contentBlocks: ContentBlock[]): string {
  const headingBlock = contentBlocks.find(block => 
    block.type === 'heading' && block.level === 3);
  return headingBlock?.text || '';
}

// Parse all the content and organize by section
function extractSections(blocks: ContentBlock[]): Record<string, ContentBlock[]> {
  const sections: Record<string, string[]> = {
    'biography': [],
    'awards': [],
    'qualifications': [],
    'additional_credentials': [],
    'professional_visits': [],
    'faculty': [],
    'conferences': [],
    'podium_presentations': [],
    'poster_presentations': [],
    'courses': [],
    'cme': [],
    'publications': [],
    'executive': [],
    'affiliations': [],
    'contact': [],
  };
  
  let currentSection = 'biography';
  let inPresentationCoAuthorSection = false;
  
  // Process each block
  blocks.forEach(block => {
    if (block.type === 'heading' || block.type === 'profile_section_heading') {
      const headingText = block.text?.toLowerCase() || '';
      
      if (headingText.includes('biograph') || headingText.includes('about')) {
        currentSection = 'biography';
      } 
      else if (headingText.includes('award') || headingText.includes('distinction') || 
               headingText.includes('recognition')) {
        currentSection = 'awards';
      }
      else if (headingText.includes('qualification')) {
        currentSection = 'qualifications';
      }
      else if (headingText.includes('credential')) {
        currentSection = 'additional_credentials';
      }
      else if (headingText.includes('visit')) {
        currentSection = 'professional_visits';
      }
      else if (headingText.includes('faculty') || headingText.includes('lecture')) {
        currentSection = 'faculty';
      }
      else if (headingText.includes('conference')) {
        currentSection = 'conferences';
      }
      else if (headingText.includes('podium')) {
        currentSection = 'podium_presentations';
        inPresentationCoAuthorSection = false;
      }
      else if (headingText.includes('co-author')) {
        inPresentationCoAuthorSection = true;
      }
      else if (headingText.includes('poster')) {
        currentSection = 'poster_presentations';
      }
      else if (headingText.includes('course')) {
        currentSection = 'courses';
      }
      else if (headingText.includes('cme') || headingText.includes('continued medical')) {
        currentSection = 'cme';
      }
      else if (headingText.includes('publication')) {
        currentSection = 'publications';
      }
      else if (headingText.includes('executive') || headingText.includes('management')) {
        currentSection = 'executive';
      }
      else if (headingText.includes('affiliation') || headingText.includes('membership')) {
        currentSection = 'affiliations';
      }
      else if (headingText.includes('contact')) {
        currentSection = 'contact';
      }
    } 
    else if (block.type === 'paragraph') {
      // Add paragraph content to the current section
      if (block.text) {
        // Special handling for co-authored presentations
        if (inPresentationCoAuthorSection) {
          sections['podium_presentations'].push(block.text);
        } else {
          sections[currentSection].push(block.text);
        }
      }
    }
  });
  
  // Convert to ContentBlock format for consistency
  const result: Record<string, ContentBlock[]> = {};
  Object.entries(sections).forEach(([key, texts]) => {
    result[key] = texts.map(text => ({
      type: 'paragraph',
      text
    }));
  });
  
  return result;
}

export default async function StaffMemberPage({ params }: { params: { slug: string } }) {
  const staffMember = await getStaffMemberBySlug(params.slug);
  
  if (!staffMember) {
    notFound();
  }

  const contentBlocks = parseContentBlocks(staffMember.ContentBlocksJSON);
  const imageUrl = extractImageUrl(contentBlocks);
  const qualifications = extractQualifications(contentBlocks);
  const position = extractPosition(contentBlocks);
  const name = staffMember.Title.split('|')[0].trim();
  
  // Get sections for the CV
  const sections = extractSections(contentBlocks);

  // Modern section configuration with improved icons
  const sectionConfig = [
    { id: 'biography', title: 'Professional Biography', icon: <User className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'expertise', title: 'Areas of Expertise', icon: <Stethoscope className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'awards', title: 'Awards & Recognition', icon: <Award className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'qualifications', title: 'Qualifications', icon: <GraduationCap className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'additional_credentials', title: 'Additional Credentials', icon: <Medal className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'work_experience', title: 'Professional Experience', icon: <Briefcase className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'professional_visits', title: 'Professional Visits', icon: <Globe className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'faculty', title: 'Faculty & Guest Lectures', icon: <Users className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'conferences', title: 'Conferences', icon: <Users className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'podium_presentations', title: 'Podium Presentations', icon: <FileText className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'poster_presentations', title: 'Poster Presentations', icon: <FileText className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'courses', title: 'Courses', icon: <BookOpen className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'technical_skills', title: 'Technical Skills & Training', icon: <Bookmark className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'cme', title: 'Continued Medical Education', icon: <BookOpen className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'publications', title: 'Publications', icon: <FileText className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'areas_of_interest', title: 'Areas of Interest', icon: <Heart className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'executive', title: 'Executive & Management', icon: <Briefcase className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'languages', title: 'Languages', icon: <Globe className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'hobbies', title: 'Personal Interests', icon: <Heart className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'affiliations', title: 'Affiliations & Memberships', icon: <Users className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
    { id: 'contact', title: 'Contact Information', icon: <Phone className="h-5 w-5 text-[#8B5C9E] mr-3" /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <SiteHeader theme="light" />
      
      <Container className="pt-24 pb-16">
        <div className="flex items-center mb-8">
          <Link 
            href="/surgeons-staff" 
            className="inline-flex items-center text-[#8B5C9E] hover:text-[#7A4F8C] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
        </div>
        
        {/* Use enhanced StaffHero component */}
        <StaffHero 
          name={name}
          position={position || 'Orthopedic Surgeon'}
          qualifications={qualifications || ''}
          imageUrl={imageUrl || '/placeholder-staff.jpg'}
        />
        
        {/* Render doctor data using the new component */}
        <div className="space-y-4">
          {/* Biography section with special styling */}
          {sections.biography && sections.biography.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="h-5 w-5 text-[#8B5C9E] mr-3" />
                  Professional Biography
                </h2>
              </div>
              <div className="p-6 prose prose-purple max-w-none">
                {sections.biography.map((block, index) => (
                  <div 
                    key={index}
                    className="text-gray-700 mb-4 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: block.text || '' }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Dynamic data sections */}
          {sectionConfig.filter(section => section.id !== 'biography').map(section => (
            <DoctorDataSection 
              key={section.id}
              doctorSlug={params.slug}
              sectionKey={section.id}
              sectionTitle={section.title}
              icon={section.icon}
            />
          ))}
        </div>
      </Container>
    </main>
  );
} 