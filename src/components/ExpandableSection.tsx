'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableSectionProps {
  children: React.ReactNode;
  collapsedHeight?: number;
}

export default function ExpandableSection({ children, collapsedHeight = 200 }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className="overflow-hidden transition-max-height duration-300"
        style={{ maxHeight: expanded ? 'none' : `${collapsedHeight}px` }}
      >
        {children}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center text-purple-700 hover:text-purple-900 font-medium focus:outline-none"
      >
        {expanded ? (
          <>
            Show Less <ChevronUp className="ml-1 h-4 w-4" />
          </>
        ) : (
          <>
            Show More <ChevronDown className="ml-1 h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
