"use client";

import React from 'react';
import Image from 'next/image';

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
      else if (headingText.includes('experience') || headingText.includes('career')) {
        currentSection = 'Experience';
      }
      else if (headingText.includes('award') || headingText.includes('recognition') || 
               headingText.includes('achievement')) {
        currentSection = 'Awards';
      }
      else if (headingText.includes('publication') || headingText.includes('research') || 
               headingText.includes('paper')) {
        currentSection = 'Publications';
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
            className={`${fontSize} font-bold text-blue-900 mb-4 mt-8`}
          >
            {block.text}
          </HeadingTag>
        );
        
      case 'image':
        return (
          <div key={index} className="my-8 rounded-lg overflow-hidden">
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
        <section key={section} className="mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-3">
            {section}
          </h2>
          
          <div>
            {blocks.map((block, index) => renderBlock(block, index))}
          </div>
        </section>
      ))}
    </div>
  );
} 