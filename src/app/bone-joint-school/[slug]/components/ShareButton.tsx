'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const shareText = `Check out this article: ${title}`;
  
  const shareHandlers = [
    {
      name: 'Facebook',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      },
    },
    {
      name: 'Twitter',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
      },
    },
    {
      name: 'WhatsApp',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`, '_blank');
      },
    },
    {
      name: 'Copy Link',
      action: () => {
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
      },
    },
  ];
  
  return (
    <div className="relative group">
      <button 
        className="flex items-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        aria-label="Share this article"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <div className="py-2">
          {shareHandlers.map((handler) => (
            <button
              key={handler.name}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]"
              onClick={handler.action}
            >
              {handler.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 