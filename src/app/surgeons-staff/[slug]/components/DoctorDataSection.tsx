"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DoctorDataProps {
  doctorSlug: string;
  sectionKey: string;
  sectionTitle: string;
  icon: React.ReactNode;
}

export default function DoctorDataSection({ doctorSlug, sectionKey, sectionTitle, icon }: DoctorDataProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/doctor-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorSlug,
            sectionKey
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }

        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [doctorSlug, sectionKey]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 p-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const displayItems = isExpanded ? items : items.slice(0, 3);

  // Function to safely render HTML content
  const renderHTML = (html: string) => {
    return { __html: html };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div 
        className="p-5 border-b border-gray-100 flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          {icon}
          <span className="ml-3">{sectionTitle}</span>
        </h2>
        <button className="text-gray-500 hover:text-[#8B5C9E] transition-colors">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="p-5">
        <div className="space-y-3">
          {displayItems.map((item, index) => (
            <div key={index} className="flex">
              <ArrowRight className="h-5 w-5 text-[#8B5C9E] mr-3 flex-shrink-0 mt-0.5" />
              <div 
                className="text-gray-700"
                dangerouslySetInnerHTML={renderHTML(item)}
              />
            </div>
          ))}
        </div>
        
        {items.length > 3 && !isExpanded && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="mt-4 text-[#8B5C9E] hover:text-[#7A4F8C] font-medium flex items-center"
          >
            Show all {items.length} items
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        )}
        
        {isExpanded && items.length > 3 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="mt-4 text-[#8B5C9E] hover:text-[#7A4F8C] font-medium flex items-center"
          >
            Show less
            <ChevronUp className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
} 