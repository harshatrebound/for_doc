"use client";

import React from 'react';
import Image from 'next/image';
import BookingButton from '@/components/BookingButton';
import { Award, User, MessageCircle, GraduationCap, Briefcase, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

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

interface StaffProfileProps {
  staffMember: StaffMember;
  contentBlocks: ContentBlock[];
}

function extractImageUrl(contentBlocks: ContentBlock[]): string | null {
  const imageBlock = contentBlocks.find(block => block.type === 'image');
  return imageBlock?.src || null;
}

function extractContactInfo(contentBlocks: ContentBlock[]): string | null {
  // Look for contact information in the content blocks
  const contactBlock = contentBlocks.find(block => 
    block.type === 'paragraph' && 
    (block.text?.includes('Phone') || 
     block.text?.includes('Email') || 
     block.text?.includes('Contact'))
  );
  
  return contactBlock?.text || null;
}

function extractSpecializations(staffMember: StaffMember): string[] {
  if (!staffMember.Specializations) return [];
  
  // Parse specializations from the CSV data
  return staffMember.Specializations.split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

// Function to extract specific sections from content blocks
function extractSection(contentBlocks: ContentBlock[], sectionType: string): ContentBlock[] {
  let inTargetSection = false;
  const relevantBlocks: ContentBlock[] = [];
  
  for (const block of contentBlocks) {
    if (
      (block.type === 'heading' || block.type === 'profile_section_heading') && 
      block.level === 2 &&
      block.text?.toLowerCase().includes(sectionType.toLowerCase())
    ) {
      inTargetSection = true;
      continue; // Skip the heading
    } else if (
      inTargetSection && 
      (block.type === 'heading' || block.type === 'profile_section_heading') && 
      block.level === 2
    ) {
      break; // End section when another heading is found
    }
    
    if (inTargetSection) {
      relevantBlocks.push(block);
    }
  }
  
  return relevantBlocks;
}

export function StaffProfile({ staffMember, contentBlocks }: StaffProfileProps) {
  const imageUrl = extractImageUrl(contentBlocks);
  const contactInfo = extractContactInfo(contentBlocks) || staffMember.ContactInfo;
  const specializations = extractSpecializations(staffMember);
  
  // Extract expertise and qualifications
  const expertiseBlocks = extractSection(contentBlocks, 'expertise');
  const qualificationsBlocks = extractSection(contentBlocks, 'qualification');
  const experienceBlocks = extractSection(contentBlocks, 'experience');
  const awardsBlocks = extractSection(contentBlocks, 'awards');
  
  return (
    <aside className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      {imageUrl && (
        <div className="mb-0">
          <Image
            src={imageUrl}
            alt={staffMember.Title.split('|')[0].trim()}
            width={400}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      <div className="p-6 space-y-6">
        {/* Booking CTA - Top Position */}
        <div className="mb-6">
          <BookingButton 
            className="w-full bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white text-center py-3 px-4 rounded-md font-medium transition duration-300 flex items-center justify-center"
            text="Book an Appointment"
            icon={<ArrowRight className="w-5 h-5 mr-2" />}
          />
        </div>
        
        {contactInfo && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-[#8B5C9E]" />
              Contact Information
            </h3>
            <div 
              className="text-gray-700 pl-7"
              dangerouslySetInnerHTML={{ __html: contactInfo }}
            />
          </div>
        )}
        
        {specializations.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-[#8B5C9E]" />
              Specializations
            </h3>
            <ul className="space-y-2 pl-7">
              {specializations.map((spec, index) => (
                <li key={index} className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-[#8B5C9E] mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {expertiseBlocks.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="mr-2 h-5 w-5 text-[#8B5C9E]" />
              Expertise
            </h3>
            <ul className="space-y-2 pl-7">
              {expertiseBlocks.map((block, index) => (
                block.type === 'paragraph' ? (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-[#8B5C9E] mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: block.text || '' }} />
                  </li>
                ) : null
              ))}
            </ul>
          </div>
        )}
        
        {qualificationsBlocks.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="mr-2 h-5 w-5 text-[#8B5C9E]" />
              Qualifications
            </h3>
            <ul className="space-y-2 pl-7">
              {qualificationsBlocks.map((block, index) => (
                block.type === 'paragraph' ? (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-[#8B5C9E] mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: block.text || '' }} />
                  </li>
                ) : null
              ))}
            </ul>
          </div>
        )}
        
        {awardsBlocks.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="mr-2 h-5 w-5 text-[#8B5C9E]" />
              Awards & Recognition
            </h3>
            <ul className="space-y-2 pl-7">
              {awardsBlocks.map((block, index) => (
                block.type === 'paragraph' ? (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 text-[#8B5C9E] mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: block.text || '' }} />
                  </li>
                ) : null
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
} 