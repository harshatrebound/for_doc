'use client';

import React from 'react';
import Image from 'next/image';

interface ContentBlock {
  type: string;
  level?: number;
  text?: string;
  imageUrl?: string;
  caption?: string;
  listItems?: string[];
  url?: string;
}

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="p-4 rounded-md bg-gray-100">
        <p className="text-gray-500 italic">No content available for this procedure.</p>
      </div>
    );
  }

  // Process list items - converts adjacent list items into a single list
  const processBlocks = () => {
    const processedBlocks: ContentBlock[] = [];
    let currentListItems: string[] = [];
    let currentListType: string | null = null;
    
    blocks.forEach((block, index) => {
      // Special handling for consecutive list items
      if (block.type === 'list-item' || block.type === 'numbered-list-item') {
        const listType = block.type === 'list-item' ? 'list' : 'numbered-list';
        
        // If starting a new list type or first list
        if (listType !== currentListType) {
          // If we have an existing list, add it first
          if (currentListItems.length > 0) {
            processedBlocks.push({
              type: currentListType!,
              listItems: [...currentListItems]
            });
            currentListItems = [];
          }
          
          // Start new list
          currentListType = listType;
        }
        
        // Add this item to current list
        if (block.text) {
          currentListItems.push(block.text);
        }
      } else {
        // Not a list item, so finish any current list
        if (currentListItems.length > 0) {
          processedBlocks.push({
            type: currentListType!,
            listItems: [...currentListItems]
          });
          currentListItems = [];
          currentListType = null;
        }
        
        // Add the non-list block
        processedBlocks.push(block);
      }
    });
    
    // Add any remaining list items
    if (currentListItems.length > 0) {
      processedBlocks.push({
        type: currentListType!,
        listItems: currentListItems
      });
    }
    
    return processedBlocks;
  };

  // Handle HTML content inside text
  const renderHTML = (html: string) => {
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const processedBlocks = processBlocks();

  return (
    <div className="space-y-6">
      {processedBlocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
            const headingClasses = {
              h2: 'text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4',
              h3: 'text-xl md:text-2xl font-semibold text-gray-800 mt-6 mb-3',
              h4: 'text-lg md:text-xl font-medium text-gray-800 mt-5 mb-2',
              h5: 'text-base md:text-lg font-medium text-gray-700 mt-4 mb-2',
              h6: 'text-sm md:text-base font-medium text-gray-700 mt-4 mb-2',
            }[`h${block.level || 2}`];

            return (
              <HeadingTag key={index} className={headingClasses} id={`section-${index}`}>
                {block.text && renderHTML(block.text)}
              </HeadingTag>
            );

          case 'paragraph':
            return (
              <p key={index} className="text-gray-700 leading-relaxed">
                {block.text && renderHTML(block.text)}
              </p>
            );

          case 'image':
            return (
              <figure key={index} className="my-6">
                <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                  {block.imageUrl && (
                    <Image
                      src={block.imageUrl}
                      alt={block.caption || 'Procedure image'}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-sm text-center text-gray-500">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'list':
            return (
              <ul key={index} className="list-disc pl-6 space-y-2 text-gray-700">
                {block.listItems?.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderHTML(item)}</li>
                ))}
              </ul>
            );

          case 'numbered-list':
            return (
              <ol key={index} className="list-decimal pl-6 space-y-2 text-gray-700">
                {block.listItems?.map((item, itemIndex) => (
                  <li key={itemIndex}>{renderHTML(item)}</li>
                ))}
              </ol>
            );

          case 'link':
            return (
              <div key={index} className="my-4">
                <a 
                  href={block.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#8B5C9E] hover:underline"
                >
                  {block.text && renderHTML(block.text) || block.url}
                </a>
              </div>
            );

          case 'divider':
            return <hr key={index} className="my-6 border-gray-200" />;

          default:
            // For any unknown block types, we'll render as a paragraph
            if (block.text) {
              return (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {renderHTML(block.text)}
                </p>
              );
            }
            return null;
        }
      })}
    </div>
  );
} 