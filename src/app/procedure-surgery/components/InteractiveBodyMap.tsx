'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryItem } from './CategoryFilter';

interface InteractiveBodyMapProps {
  categories: CategoryItem[];
  onCategorySelect?: (categoryId: string | null) => void;
  color?: string;
}

// Define body regions and their positions
const bodyRegions = [
  { id: 'head_neck', name: 'Head & Neck', x: 50, y: 15 },
  { id: 'shoulder', name: 'Shoulder', x: 30, y: 25 },
  { id: 'arm_elbow', name: 'Arm & Elbow', x: 25, y: 35 },
  { id: 'hand_wrist', name: 'Hand & Wrist', x: 20, y: 45 },
  { id: 'spine', name: 'Spine', x: 50, y: 35 },
  { id: 'hip', name: 'Hip', x: 40, y: 50 },
  { id: 'knee', name: 'Knee', x: 40, y: 65 },
  { id: 'foot_ankle', name: 'Foot & Ankle', x: 40, y: 85 },
];

export const InteractiveBodyMap = ({ categories, onCategorySelect, color = '#8B5C9E' }: InteractiveBodyMapProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Map body regions to actual categories if they exist
  const mappedRegions = bodyRegions.map(region => {
    const matchingCategory = categories.find(cat => 
      cat.id.toLowerCase().includes(region.id) || 
      cat.name.toLowerCase().includes(region.name.toLowerCase())
    );
    
    return {
      ...region,
      categoryId: matchingCategory?.id || region.id,
      count: matchingCategory?.count || 0,
      active: matchingCategory !== undefined
    };
  });
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    // Call callback if provided
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
    
    // Navigate to category
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', categoryId);
    params.delete('page'); // Reset to page 1
    
    router.push(`/procedure-surgery?${params.toString()}`);
  };

  return (
    <div className="absolute right-[5%] top-1/2 transform -translate-y-1/2 hidden md:block">
      <div className="relative w-[300px] h-[500px]">
        {/* Body image */}
        <Image 
          src="/images/human-body-outline.svg" 
          alt="Interactive human body" 
          fill
          className="object-contain"
          style={{ filter: `grayscale(100%) brightness(1000%) sepia(100%) hue-rotate(${color === 'white' ? '0deg' : '280deg'}) saturate(0%)` }}
        />
        
        {/* Clickable hotspots */}
        {mappedRegions.filter(r => r.active).map((region) => (
          <motion.div
            key={region.id}
            className="absolute cursor-pointer"
            style={{ 
              left: `${region.x}%`, 
              top: `${region.y}%`
            }}
            initial={{ scale: 0 }}
            animate={{ 
              scale: hoveredRegion === region.id ? 1.2 : 1,
              backgroundColor: hoveredRegion === region.id ? (color === 'white' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(139, 92, 158, 0.6)') : (color === 'white' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(139, 92, 158, 0.3)')
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.2, backgroundColor: color === 'white' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(139, 92, 158, 0.6)' }}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => handleCategorySelect(region.categoryId)}
          >
            <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color === 'white' ? 'rgba(255,255,255,0.7)' : '#A174B5' }}></span>
              <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4" style={{ backgroundColor: color === 'white' ? 'white' : '#8B5C9E' }}></span>
              
              {/* Tooltip */}
              <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-3 py-2 text-sm whitespace-nowrap z-10 transition-opacity duration-200 ${
                hoveredRegion === region.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <div className="font-medium text-gray-800">{region.name}</div>
                <div className="text-xs text-[#8B5C9E]">{region.count} procedures</div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 