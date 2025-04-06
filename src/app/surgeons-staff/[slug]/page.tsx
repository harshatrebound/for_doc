import { Metadata } from 'next';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import Image from 'next/image';
import React from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { StaffProfile } from './components/StaffProfile';
import { StaffHero } from './components/StaffHero';
import { StaffContentBlocks } from './components/StaffContentBlocks';

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
    block.text?.includes('MBBS') ||
    block.text?.includes('MS') ||
    block.text?.includes('MSc'));
  
  return paragraphBlock?.text?.replace(/<[^>]*>/g, '') || '';
}

function extractPosition(contentBlocks: ContentBlock[]): string {
  const headingBlock = contentBlocks.find(block => 
    block.type === 'heading' && block.level === 3);
  return headingBlock?.text || '';
}

function parseBreadcrumbs(breadcrumbJSON: string): { name: string; url: string | null }[] {
  try {
    return JSON.parse(breadcrumbJSON);
  } catch (error: any) {
    console.error('Error parsing breadcrumb JSON:', error);
    return [];
  }
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
  
  const breadcrumbs = parseBreadcrumbs(staffMember.BreadcrumbJSON).map(item => ({
    name: item.name,
    href: item.url || '#'
  }));

  // Add the home link if not present
  if (!breadcrumbs.some(item => item.name === 'Home')) {
    breadcrumbs.unshift({ name: 'Home', href: '/' });
  }

  return (
    <main className="min-h-screen bg-white">
      <StaffHero
        name={name}
        position={position}
        qualifications={qualifications}
        imageUrl={imageUrl}
      />
      
      <Container className="py-12">
        <Breadcrumb items={breadcrumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          <div className="lg:col-span-1">
            <StaffProfile 
              staffMember={staffMember}
              contentBlocks={contentBlocks}
            />
          </div>
          
          <div className="lg:col-span-2">
            <StaffContentBlocks 
              contentBlocks={contentBlocks} 
            />
          </div>
        </div>
      </Container>
    </main>
  );
} 