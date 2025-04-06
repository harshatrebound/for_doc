import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// Define the type for different content blocks
type ContentBlock = {
  type: string;
  text?: string;
  src?: string;
  alt?: string;
  level?: number;
  icon?: string;
  items?: string[];
};

// Function to convert URLs in the text to actual link components
const convertLinksInText = (text: string) => {
  if (!text) return null;
  
  // Remove class attributes and other unnecessary attributes from HTML
  const cleanedText = text.replace(/<([a-z][a-z0-9]*)\s+class="[^"]*"([^>]*)>/gi, '<$1$2>');
  
  // Extract any <a> tags and retain them as React Link components
  const parts = [];
  const regex = /<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(cleanedText)) !== null) {
    // Add the text before the link
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: cleanedText.slice(lastIndex, match.index) }} />
      );
    }
    
    // Add the link
    const href = match[1];
    const linkText = match[2].replace(/<\/?[^>]+(>|$)/g, ""); // Strip any HTML from link text
    
    // Make external links open in a new tab, internal links use Next.js Link
    const isExternal = href.startsWith("http") || href.startsWith("www");
    if (isExternal) {
      parts.push(
        <a 
          key={`link-${match.index}`} 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#8B5C9E] hover:underline"
        >
          {linkText}
        </a>
      );
    } else {
      parts.push(
        <Link 
          key={`link-${match.index}`} 
          href={href} 
          className="text-[#8B5C9E] hover:underline"
        >
          {linkText}
        </Link>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add the text after the last link (or all text if no links)
  if (lastIndex < cleanedText.length) {
    parts.push(
      <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: cleanedText.slice(lastIndex) }} />
    );
  }
  
  return parts.length > 0 ? parts : <span dangerouslySetInnerHTML={{ __html: cleanedText }} />;
};

// The main content renderer component
const PostContentRenderer = ({ contentBlocks }: { contentBlocks: ContentBlock[] }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return <p className="text-gray-500 italic">No content available</p>;
  }

  return (
    <div className="space-y-6">
      {contentBlocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <div key={`para-${index}`} className="text-gray-700 leading-relaxed">
                {convertLinksInText(block.text || '')}
              </div>
            );
          
          case 'heading':
            const HeadingTag = block.level ? `h${block.level}` as keyof JSX.IntrinsicElements : 'h2';
            const headingClasses = {
              1: 'text-3xl md:text-4xl font-bold text-gray-900 mb-4',
              2: 'text-2xl font-bold text-gray-900 mb-3 mt-8',
              3: 'text-xl font-bold text-gray-800 mb-2 mt-6',
              4: 'text-lg font-semibold text-gray-800 mb-2 mt-4',
              5: 'text-base font-semibold text-gray-800 mb-2',
              6: 'text-sm font-semibold text-gray-800 mb-2'
            }[block.level || 2];
            
            return (
              <HeadingTag key={`heading-${index}`} className={headingClasses} id={`heading-${index}`}>
                {convertLinksInText(block.text || '')}
              </HeadingTag>
            );
          
          case 'image':
            return (
              <figure key={`image-${index}`} className="my-8">
                <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
                  <Image
                    src={block.src || ''}
                    alt={block.alt || 'Article image'}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
                {block.alt && (
                  <figcaption className="mt-2 text-sm text-center text-gray-500">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );
          
          case 'styled_list_item':
            let icon;
            switch (block.icon) {
              case 'arrow-right':
                icon = (
                  <span className="inline-block mr-2 text-[#8B5C9E]">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-4 h-4"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </span>
                );
                break;
              default:
                icon = (
                  <span className="inline-block mr-2 text-[#8B5C9E]">•</span>
                );
            }
            
            return (
              <div key={`list-item-${index}`} className="flex items-start mb-3">
                <div className="flex-shrink-0 mt-1">{icon}</div>
                <div className="flex-grow">
                  {convertLinksInText(block.text || '')}
                </div>
              </div>
            );
          
          case 'unordered-list':
            if (!block.items || block.items.length === 0) {
              return null;
            }
            
            return (
              <ul key={`list-${index}`} className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                {block.items.map((item, itemIndex) => (
                  <li key={`list-item-${index}-${itemIndex}`}>
                    {convertLinksInText(item)}
                  </li>
                ))}
              </ul>
            );
          
          case 'ordered-list':
            if (!block.items || block.items.length === 0) {
              return null;
            }
            
            return (
              <ol key={`ordered-list-${index}`} className="list-decimal list-inside space-y-2 ml-4 text-gray-700">
                {block.items.map((item, itemIndex) => (
                  <li key={`ordered-list-item-${index}-${itemIndex}`}>
                    {convertLinksInText(item)}
                  </li>
                ))}
              </ol>
            );

          default:
            // For any unknown block types, just return null
            return null;
        }
      })}
    </div>
  );
};

export default PostContentRenderer; 