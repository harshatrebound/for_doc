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
        className="flex items-center gap-2 py-4 px-8 bg-white border-2 border-white text-[#8B5C9E] hover:bg-gray-100 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
        aria-label="Share this article"
      >
        <Share2 className="w-5 h-5" />
        <span>Share</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
        <div className="py-2">
          {shareHandlers.map((handler) => (
            <button
              key={handler.name}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E] transition-colors font-medium"
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