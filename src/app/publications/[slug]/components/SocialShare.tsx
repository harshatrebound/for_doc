'use client';

// Import React namespace to avoid TypeScript errors
import * as React from 'react';
const { useState, useEffect } = React;
import { Share2, Twitter, Facebook, Linkedin, Mail, LinkIcon, Check } from 'lucide-react';

interface SocialShareProps {
  title: string;
}

export default function SocialShare({ title }: SocialShareProps) {
  // Simple state for copied status
  const [copied, setCopied] = useState(false);
  
  // Don't set share URLs during server-side rendering
  // This prevents hydration mismatch
  const [shareUrls, setShareUrls] = useState({
    twitter: '#',
    facebook: '#',
    linkedin: '#',
    mail: '#',
    current: ''
  });
  
  // Set URLs only on client-side
  useEffect(() => {
    const currentUrl = window.location.href;
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(currentUrl);
    
    setShareUrls({
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      mail: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      current: currentUrl
    });
  }, [title]);
  
  // Copy URL to clipboard
  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && shareUrls.current) {
      navigator.clipboard.writeText(shareUrls.current)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          console.error('Failed to copy URL to clipboard');
        });
    }
  };
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600 mr-1">Share:</span>
      
      <a 
        href={shareUrls.twitter} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>
      
      <a 
        href={shareUrls.facebook} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#4267B2] hover:text-white transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </a>
      
      <a 
        href={shareUrls.linkedin} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#0077B5] hover:text-white transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>
      
      <a 
        href={shareUrls.mail}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white transition-colors"
        aria-label="Share via Email"
      >
        <Mail className="w-4 h-4" />
      </a>
      
      <button
        onClick={copyToClipboard}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-[#8B5C9E] hover:text-white transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      </button>
    </div>
  );
} 