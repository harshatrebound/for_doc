"use client";

import React from 'react';
import Image from 'next/image';
import { Award, Briefcase, GraduationCap, User, BookOpen, Trophy, ArrowRight } from 'lucide-react';

interface ContentBlock {
  type: string;
  level?: number;
  text?: string;
  src?: string;
  alt?: string;
}

interface StaffContentBlocksProps {
  contentBlocks: ContentBlock[];
}

// Helper function to organize content into sections based on headings
function organizeContentBlocks(blocks: ContentBlock[]): Record<string, ContentBlock[]> {
  const sections: Record<string, ContentBlock[]> = {
    'Professional Biography': [],
    'Education': [],
    'Experience': [],
    'Awards': [],
    'Publications': [],
    'Research': [],
    'Other': []
  };
  
  let currentSection = 'Professional Biography';
  
  blocks.forEach(block => {
    // Skip image blocks that are likely profile images
    if (block.type === 'image' && block.src?.includes('profile') || 
        block.alt?.toLowerCase().includes('profile')) {
      return;
    }
    
    // Detect section from headings
    if (block.type === 'heading' || block.type === 'profile_section_heading') {
      const headingText = block.text?.toLowerCase() || '';
      
      if (headingText.includes('biography') || headingText.includes('about')) {
        currentSection = 'Professional Biography';
      } 
      else if (headingText.includes('education') || headingText.includes('qualification')) {
        currentSection = 'Education';
      }
      else if (headingText.includes('experience') || headingText.includes('career') || 
               headingText.includes('work') || headingText.includes('professional work')) {
        currentSection = 'Experience';
      }
      else if (headingText.includes('award') || headingText.includes('recognition') || 
               headingText.includes('achievement') || headingText.includes('distinction')) {
        currentSection = 'Awards';
      }
      else if (headingText.includes('publication') || headingText.includes('paper') || 
               headingText.includes('journal')) {
        currentSection = 'Publications';
      }
      else if (headingText.includes('research') || headingText.includes('project') || 
               headingText.includes('study')) {
        currentSection = 'Research';
      }
      else {
        sections[currentSection].push(block);
      }
    } else {
      sections[currentSection].push(block);
    }
  });
  
  // Filter out empty sections
  return Object.fromEntries(
    Object.entries(sections).filter(([_, blocks]) => blocks.length > 0)
  );
}

// Get appropriate icon for section
function getSectionIcon(sectionName: string) {
  switch (sectionName) {
    case 'Professional Biography':
      return <User className="h-6 w-6 text-[#8B5C9E]" />;
    case 'Education':
      return <GraduationCap className="h-6 w-6 text-[#8B5C9E]" />;
    case 'Experience':
      return <Briefcase className="h-6 w-6 text-[#8B5C9E]" />;
    case 'Awards':
      return <Trophy className="h-6 w-6 text-[#8B5C9E]" />;
    case 'Publications':
      return <BookOpen className="h-6 w-6 text-[#8B5C9E]" />;
    case 'Research':
      return <BookOpen className="h-6 w-6 text-[#8B5C9E]" />;
    default:
      return <Award className="h-6 w-6 text-[#8B5C9E]" />;
  }
}

export function StaffContentBlocks({ contentBlocks }: StaffContentBlocksProps) {
  const organizedContent = organizeContentBlocks(contentBlocks);
  
  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <div 
            key={index}
            className="text-gray-700 mb-6"
            dangerouslySetInnerHTML={{ __html: block.text || '' }}
          />
        );
        
      case 'heading':
      case 'profile_section_heading':
        const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
        const fontSize = block.level === 2 ? 'text-2xl' : block.level === 3 ? 'text-xl' : 'text-lg';
        
        return (
          <HeadingTag 
            key={index}
            className={`${fontSize} font-bold text-[#2E3A59] mb-4 mt-8`}
          >
            {block.text}
          </HeadingTag>
        );
        
      case 'image':
        return (
          <div key={index} className="my-8 rounded-lg overflow-hidden shadow-md">
            <Image
              src={block.src || ''}
              alt={block.alt || 'Image'}
              width={800}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="prose prose-lg max-w-none">
      {Object.entries(organizedContent).map(([section, blocks]) => (
        <section key={section} className="mb-12 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-[#2E3A59] mb-6 border-b border-gray-100 pb-4 flex items-center">
            {getSectionIcon(section)}
            <span className="ml-3">{section}</span>
          </h2>
          
          <div className="pl-4">
            {blocks.map((block, index) => renderBlock(block, index))}
          </div>
        </section>
      ))}
    </div>
  );
} 