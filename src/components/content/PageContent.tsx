import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { ContentBlock } from '@/lib/content-service';

interface PageContentProps {
  contentBlocks: ContentBlock[];
}

export default function PageContent({ contentBlocks }: PageContentProps) {
  if (!contentBlocks || contentBlocks.length === 0) {
    return <div className="text-center py-10">No content available.</div>;
  }

  return (
    <div className="content-wrapper prose prose-lg max-w-none">
      {contentBlocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return renderHeading(block, index);
          case 'paragraph':
            return renderParagraph(block, index);
          case 'styled_list_item':
            return renderStyledListItem(block, index);
          default:
            return renderParagraph(block, index);
        }
      })}
    </div>
  );
}

function renderHeading(block: ContentBlock, index: number) {
  const level = block.level || 2;
  const headingClasses = "font-bold text-slate-800 mb-4";
  
  switch (level) {
    case 1:
      return (
        <h1 
          key={index} 
          className={`${headingClasses} text-3xl md:text-4xl`}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );
    case 2:
      return (
        <h2 
          key={index} 
          className={`${headingClasses} text-2xl md:text-3xl`}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );
    case 3:
      return (
        <h3 
          key={index} 
          className={`${headingClasses} text-xl md:text-2xl`}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );
    case 4:
      return (
        <h4 
          key={index} 
          className={`${headingClasses} text-lg md:text-xl`}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );
    default:
      return (
        <h5 
          key={index} 
          className={`${headingClasses} text-lg`}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );
  }
}

function renderParagraph(block: ContentBlock, index: number) {
  return (
    <div 
      key={index} 
      className="mb-6 text-slate-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: block.text }}
    />
  );
}

function renderStyledListItem(block: ContentBlock, index: number) {
  const IconComponent = block.icon === 'arrow-right' 
    ? ArrowRight 
    : ChevronRight;
  
  return (
    <div key={index} className="flex items-start mb-4 group">
      <div className="mr-2 mt-1 text-blue-600 flex-shrink-0">
        <IconComponent size={18} className="group-hover:translate-x-1 transition-transform" />
      </div>
      <div 
        className="flex-1 text-slate-700" 
        dangerouslySetInnerHTML={{ __html: block.text }}
      />
    </div>
  );
} 