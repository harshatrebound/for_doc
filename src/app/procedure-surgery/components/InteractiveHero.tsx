'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryItem } from './CategoryFilter';

interface InteractiveHeroProps {
  categories: CategoryItem[];
  onCategorySelect?: (categoryId: string | null) => void; // Made optional
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

export const InteractiveHero = ({ categories, onCategorySelect }: InteractiveHeroProps) => {
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
    <div className="relative w-full h-[600px] bg-gradient-to-b from-[#8B5C9E]/5 via-purple-100 to-white rounded-2xl overflow-hidden pt-16 mx-4 md:mx-8 lg:mx-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/images/blue-grid.svg')] opacity-5"></div>
      
      <div className="absolute top-0 left-0 w-full h-full p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="block">Specialized</span>
            <span className="bg-gradient-to-r from-[#8B5C9E] to-[#A174B5] text-transparent bg-clip-text">
              Surgical Procedures
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our comprehensive range of advanced surgical procedures 
            designed to restore function and improve quality of life.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button 
              className="px-6 py-3 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white rounded-lg shadow-lg transition-colors flex items-center space-x-2 font-medium"
              onClick={() => document.getElementById('procedures-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span>Explore All Procedures</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Interactive Body Figure */}
      <div className="absolute right-[5%] top-1/2 transform -translate-y-1/2 hidden md:block">
        <div className="relative w-[300px] h-[500px]">
          {/* Body image */}
          <Image 
            src="/images/human-body-outline.svg" 
            alt="Interactive human body" 
            fill
            className="object-contain"
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
                backgroundColor: hoveredRegion === region.id ? 'rgba(139, 92, 158, 0.6)' : 'rgba(139, 92, 158, 0.3)'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.2, backgroundColor: 'rgba(139, 92, 158, 0.6)' }}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => handleCategorySelect(region.categoryId)}
            >
              <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A174B5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-[#8B5C9E]"></span>
                
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
    </div>
  );
}; 