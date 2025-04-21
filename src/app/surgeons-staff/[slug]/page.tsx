import { Metadata } from 'next';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import Image from 'next/image';
import React from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Award, BookOpen, Briefcase, GraduationCap, Medal, User, FileText, Building, Users } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import BookingButton from '@/components/BookingButton';

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

  // Section configuration with icons and titles
  const sectionConfig = [
    { id: 'biography', title: 'Professional Biography', icon: User },
    { id: 'awards', title: 'Awards & Distinction', icon: Award },
    { id: 'qualifications', title: 'Qualifications', icon: GraduationCap },
    { id: 'additional_credentials', title: 'Additional Credentials', icon: Medal },
    { id: 'professional_visits', title: 'Professional Visits', icon: Building },
    { id: 'faculty', title: 'Faculty & Guest Lectures', icon: Users },
    { id: 'conferences', title: 'Conferences', icon: Users },
    { id: 'podium_presentations', title: 'Podium Presentations', icon: Users },
    { id: 'poster_presentations', title: 'Poster Presentations', icon: FileText },
    { id: 'courses', title: 'Courses', icon: BookOpen },
    { id: 'cme', title: 'Continued Medical Education (CMEs)', icon: BookOpen },
    { id: 'publications', title: 'Publications', icon: FileText },
    { id: 'executive', title: 'Executive & Management Experience', icon: Briefcase },
    { id: 'affiliations', title: 'Affiliations & Memberships', icon: Users },
    { id: 'contact', title: 'Contact Information', icon: Users },
  ];

  // Format HTML content with proper lists
  const formatContent = (content: ContentBlock[]) => {
    return content.map((block, index) => {
      const text = block.text || '';
      if (text.includes('</li>')) {
        // Already formatted as a list
        return (
          <div 
            key={index}
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      } else {
        // Format as a list item with arrow icon
        return (
          <div key={index} className="flex mb-3">
            <ArrowRight className="h-5 w-5 text-[#8B5C9E] mr-3 flex-shrink-0 mt-0.5" />
            <div 
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        );
      }
    });
  };

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
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
              {position && (
                <h2 className="text-xl text-gray-700 mb-3">{position}</h2>
              )}
              {qualifications && (
                <div className="text-sm text-gray-600">{qualifications}</div>
              )}
            </div>
            
            {/* Book Appointment Button */}
            <div className="mt-4 md:mt-0">
              <BookingButton 
                className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white text-center py-3 px-6 rounded-md font-medium transition-all duration-300 hover:shadow-lg"
                text="Book Appointment"
              />
            </div>
          </div>
        </div>
        
        {/* Render all CV sections */}
        <div className="space-y-8">
          {sectionConfig.map(section => {
            const content = sections[section.id] || [];
            if (content.length === 0) return null;
            
            const Icon = section.icon;
            
            return (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Icon className="h-5 w-5 text-[#8B5C9E] mr-3" />
                    {section.title}
                  </h2>
                </div>
                <div className="p-6">
                  {formatContent(content)}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </main>
  );
} 