"use client";

import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ScrollToProceduresButton() {
  const handleClick = () => {
    document.getElementById('procedures-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-lg px-6 py-3 text-base font-medium transition-all duration-300"
      onClick={handleClick}
    >
      <span className="flex items-center">
        Explore All Procedures
        <ArrowDown className="ml-2 w-5 h-5" />
      </span>
    </Button>
  );
} 