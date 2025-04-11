'use client';

import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface ScrollToContentButtonProps {
  targetId: string;
  buttonText: string;
}

export function ScrollToContentButton({ targetId, buttonText }: ScrollToContentButtonProps) {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-full px-8 py-3 text-base font-medium transition-all duration-300 w-auto min-w-48"
      onClick={handleClick}
    >
      <span className="flex items-center justify-center">
        {buttonText}
        <BookOpen className="ml-2 w-5 h-5" /> 
      </span>
    </Button>
  );
} 