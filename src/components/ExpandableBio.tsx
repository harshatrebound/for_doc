'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type ExpandableBioProps = {
  initialParagraph: React.ReactNode;
  additionalParagraphs: React.ReactNode[];
};

export default function ExpandableBio({ initialParagraph, additionalParagraphs }: ExpandableBioProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="prose max-w-none">
      <div>{initialParagraph}</div>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {additionalParagraphs.map((paragraph, index) => (
            <div key={index}>{paragraph}</div>
          ))}
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center mt-4 text-purple-700 hover:text-purple-900 font-medium focus:outline-none transition-colors"
      >
        {isExpanded ? (
          <>
            <span>Read Less</span>
            <ChevronUp className="ml-1 h-4 w-4" />
          </>
        ) : (
          <>
            <span>Read More</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
