import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function PageTitle({ 
  title, 
  subtitle, 
  className = '',
  align = 'center' 
}: PageTitleProps) {
  const textAlign = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <div className={`mb-12 ${textAlign} ${className}`}>
      <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">{title}</h1>
      
      {subtitle && (
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
      )}
      
      <div className="w-24 h-1 bg-blue-600 mt-6 mb-2 rounded-full inline-block"></div>
    </div>
  );
} 