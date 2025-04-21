import Link from 'next/link';
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.name} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="mx-2 text-gray-400" 
                  size={14}
                />
              )}
              
              {isLast ? (
                <span className="text-[#8B5C9E] font-medium">{item.name}</span>
              ) : (
                <Link 
                  href={item.href} 
                  className="text-gray-500 hover:text-[#8B5C9E] transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 