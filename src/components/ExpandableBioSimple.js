'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ExpandableBioSimple({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Split children into first paragraph and rest
  const childrenArray = Array.isArray(children) ? children : [children];
  const firstParagraph = childrenArray[0];
  const restParagraphs = childrenArray.slice(1);
  
  return (
    <div className="prose max-w-none">
      <div>{firstParagraph}</div>
      
      {isExpanded && restParagraphs.length > 0 && (
        <div className="mt-4 space-y-4">
          {restParagraphs}
        </div>
      )}
      
      {restParagraphs.length > 0 && (
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
      )}
    </div>
  );
}
