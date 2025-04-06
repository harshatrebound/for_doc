'use client';

import React, { Fragment } from 'react';
import { ArrowRight } from 'lucide-react'; // Icon for styled lists
import { ContentBlock } from '../page'; // Corrected import path

interface TopicContentRendererProps {
  contentBlocks: ContentBlock[];
  addHeadingIds?: boolean; // New prop to add IDs for anchor links
  firstParagraphIndex?: number; // Add this prop to know the index of the removed paragraph
}

// Helper component to render icons based on string name
const IconComponent = ({ iconName }: { iconName?: string }) => {
  if (iconName === 'arrow-right') {
    return <ArrowRight className="w-4 h-4 text-[#8B5C9E] mr-3 mt-1 flex-shrink-0" />;
  }
  // Add more icons here if needed
  return null; // Default: no icon
};

export default function TopicContentRenderer({ 
  contentBlocks,
  addHeadingIds = false,
  firstParagraphIndex = -1
}: TopicContentRendererProps) {
  if (!contentBlocks || contentBlocks.length === 0) {
    return <p>No content available.</p>;
  }

  // Track if we're within a list context (consecutive styled_list_items)
  let listItems: JSX.Element[] = [];
  const renderedElements: JSX.Element[] = [];
  
  // Helper to flush any accumulated list items
  const flushListItems = () => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="my-6 space-y-3 pl-0 list-none bg-gray-50 p-6 rounded-lg">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  // Helper to calculate the original index for a block after filtering
  const getOriginalIndex = (currentIndex: number) => {
    // If we removed the first paragraph and it was before this block,
    // we need to add 1 to the current index to get the original index
    if (firstParagraphIndex >= 0 && currentIndex >= firstParagraphIndex) {
      return currentIndex + 1;
    }
    return currentIndex;
  };

  // Iterate through blocks to create elements
  contentBlocks.forEach((block, index) => {
    const originalIndex = getOriginalIndex(index);
    const key = `content-block-${originalIndex}`;
    
    if (block.type === 'styled_list_item') {
      // Add to list items collection
      listItems.push(
        <li key={key} className="flex items-start">
          <IconComponent iconName={block.icon} />
          <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: block.text }}></span>
        </li>
      );
    } else {
      // For non-list items, first flush any pending list items
      flushListItems();
      
      // Then render the current block
      switch (block.type) {
        case 'heading':
          if (block.level === 2) {
            const headingId = addHeadingIds ? `heading-${originalIndex}` : undefined;
            renderedElements.push(
              <h2 
                key={key} 
                id={headingId}
                className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-[#5a3a6d] border-b border-gray-200 pb-3 scroll-mt-28" 
                dangerouslySetInnerHTML={{ __html: block.text }} 
              />
            );
          } else if (block.level === 3) {
            renderedElements.push(
              <h3 
                key={key} 
                className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-gray-800" 
                dangerouslySetInnerHTML={{ __html: block.text }} 
              />
            );
          } else {
            // Default for other heading levels
            renderedElements.push(
              <h3 
                key={key} 
                className="text-xl font-semibold mt-6 mb-3 text-gray-800" 
                dangerouslySetInnerHTML={{ __html: block.text }} 
              />
            );
          }
          break;
          
        case 'paragraph':
          renderedElements.push(
            <p 
              key={key} 
              className="text-gray-700 leading-relaxed my-4" 
              dangerouslySetInnerHTML={{ __html: block.text }} 
            />
          );
          break;
          
        default:
          console.warn("Unknown content block type:", block.type);
      }
    }
  });
  
  // Don't forget to flush any remaining list items at the end
  flushListItems();

  return <>{renderedElements}</>;
} 