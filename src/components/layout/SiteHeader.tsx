'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

interface SiteHeaderProps {
  theme?: 'light' | 'default';
}

export default function SiteHeader({ theme = 'default' }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = theme === 'light';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl">
          <span className={isLight || scrolled ? 'text-[#8B5C9E]' : 'text-white'}>
            Sports Orthopedics
          </span>
        </Link>
        
        {/* Navigation */}
        <nav className={`px-8 py-3 rounded-full transition-all duration-300 ${
          isLight || scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white/10 backdrop-blur-md border border-white/20'
        }`}>
          <ul className="flex items-center space-x-6">
            {/* Updated links to match the requested structure */}
            {[
              { name: 'Home', href: '/' },
              { name: 'Surgeons & Staff', href: '/surgeons-staff' },
              { name: 'Procedures', href: '/procedure-surgery' },
              { name: 'Bone & Joint School', href: '/bone-joint-school' },
              { name: 'Clinical Videos', href: '/clinical-videos' },
              { name: 'Publications', href: '/publications' },
              { name: 'Gallery', href: '/gallery' },
              { name: 'Blogs', href: '/blogs' }
            ].map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`font-medium transition-colors duration-300 relative group ${
                    isLight || scrolled 
                      ? 'text-gray-800 hover:text-[#8B5C9E]' 
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5C9E] group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            ))}
            
            {/* Book an Appointment Button */}
            <li>
              <BookingButton 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isLight || scrolled
                    ? 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]'
                    : 'bg-white text-[#8B5C9E] hover:bg-white/90'
                }`}
                icon={<Calendar className="w-4 h-4 mr-2" />}
                text="Book an Appointment"
              />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 