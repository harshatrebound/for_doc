'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategory: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategoryFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Add scroll indicator logic
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();

      // Check again after possible reflow/resize
      setTimeout(checkScroll, 100);
      
      // Cleanup
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [categories]);

  // Handle scroll buttons
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Handle category change with router navigation
  const handleCategoryChange = (categoryId: string | null) => {
    // Call the callback if provided
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
    
    // Update URL with new category
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null) {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    
    // Reset page to 1 when changing category
    params.delete('page');
    
    // Navigate with new params
    router.push(`/procedure-surgery?${params.toString()}`);
  };

  // Get gradient color based on category ID
  const getCategoryColor = (category: CategoryItem) => {
    if (category.color) return category.color;

    const baseColors = [
      'from-blue-500 to-cyan-400',
      'from-green-500 to-emerald-400',
      'from-purple-500 to-indigo-400',
      'from-orange-500 to-amber-400',
      'from-rose-500 to-pink-400',
      'from-teal-500 to-green-400',
      'from-violet-500 to-purple-400',
      'from-yellow-500 to-amber-400'
    ];
    
    // Simple hash function for consistent color
    const hash = category.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return baseColors[hash % baseColors.length];
  };

  return (
    <div className="relative w-full">
      {/* Left scroll button */}
      {showLeftArrow && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
      )}

      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto py-4 px-1 space-x-3 no-scrollbar hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All categories option */}
        <button
          onClick={() => handleCategoryChange(null)}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
            activeCategory === null 
              ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-md font-semibold'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          All Procedures
        </button>

        {/* Category buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
              activeCategory === category.id
                ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-md font-semibold`
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {category.name}
            {category.count > 0 && (
              <span className="ml-2 bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right scroll button */}
      {showRightArrow && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>
      )}
    </div>
  );
}; 