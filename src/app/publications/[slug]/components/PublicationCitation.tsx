'use client';

import { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

interface PublicationCitationProps {
  title: string;
  authors: string;
  date: string;
  journal: string;
}

export default function PublicationCitation({ title, authors, date, journal }: PublicationCitationProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate citation text in standard academic format
  const generateCitation = () => {
    // Default to current year if no date provided
    const year = date || new Date().getFullYear().toString();
    
    // Default author
    const authorText = authors || "Kumar, N.";
    
    // Journal or website name
    const journalText = journal || "Sports Orthopedics Institute";
    
    // Format citation in APA style
    return `${authorText} (${year}). ${title}. ${journalText}.`;
  };
  
  const citationText = generateCitation();
  
  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(citationText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          console.error('Failed to copy citation to clipboard');
        });
    }
  };
  
  return (
    <div className="publication-citation">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 flex items-center">
          <FileText className="w-4 h-4 mr-1.5 text-[#8B5C9E]" />
          Citation
        </h4>
        
        <button
          onClick={copyToClipboard}
          className="text-xs flex items-center text-[#8B5C9E] hover:text-[#7A4C8C]"
          aria-label="Copy citation"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1" />
              Copy
            </>
          )}
        </button>
      </div>
      
      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 font-mono">
        {citationText}
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold text-sm mb-2">Details</h4>
        <dl className="space-y-2">
          <div>
            <dt className="text-xs text-gray-500">Title</dt>
            <dd className="text-sm">{title}</dd>
          </div>
          
          {authors && (
            <div>
              <dt className="text-xs text-gray-500">Author(s)</dt>
              <dd className="text-sm">{authors}</dd>
            </div>
          )}
          
          {date && (
            <div>
              <dt className="text-xs text-gray-500">Published</dt>
              <dd className="text-sm">{date}</dd>
            </div>
          )}
          
          {journal && (
            <div>
              <dt className="text-xs text-gray-500">Journal</dt>
              <dd className="text-sm">{journal}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
} 