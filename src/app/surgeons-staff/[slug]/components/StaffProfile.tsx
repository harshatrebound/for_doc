"use client";

import React from 'react';
import Image from 'next/image';
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

export function StaffProfile({ staffMember, contentBlocks }: StaffProfileProps) {
  const imageUrl = extractImageUrl(contentBlocks);
  const contactInfo = extractContactInfo(contentBlocks) || staffMember.ContactInfo;
  const specializations = extractSpecializations(staffMember);
  
  return (
    <aside className="bg-gray-50 rounded-xl p-6 shadow-sm">
      {imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={staffMember.Title.split('|')[0].trim()}
            width={400}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      <div className="space-y-6">
        {contactInfo && (
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact Information</h3>
            <div 
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: contactInfo }}
            />
          </div>
        )}
        
        {specializations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Specializations</h3>
            <ul className="space-y-1">
              {specializations.map((spec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {staffMember.Qualifications && (
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Qualifications</h3>
            <p className="text-gray-700">{staffMember.Qualifications}</p>
          </div>
        )}
        
        {/* Appointment CTA */}
        <div className="pt-4 mt-6 border-t border-gray-200">
          <BookingButton 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition duration-300"
            text="Book an Appointment"
          />
        </div>
      </div>
    </aside>
  );
} 