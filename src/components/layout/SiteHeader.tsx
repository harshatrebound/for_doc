'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Menu, X } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

interface SiteHeaderProps {
  theme?: 'light' | 'default';
}

export default function SiteHeader({ theme = 'default' }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = theme === 'light';

  // Navigation links
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Surgeons & Staff', href: '/surgeons-staff' },
    { name: 'Procedures', href: '/procedure-surgery' },
    { name: 'Bone & Joint School', href: '/bone-joint-school' },
    { name: 'Clinical Videos', href: '/clinical-videos' },
    { name: 'Publications', href: '/publications' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Blogs', href: '/blogs' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-white/95 shadow-md' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-10 mr-3">
              <Image
                src="/logo.svg"
                alt="Sports Orthopedics Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className={`font-bold text-xl ${
              isLight || scrolled ? 'text-[#8B5C9E]' : 'text-white'
            }`}>
              Sports Orthopedics
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <nav className={`px-8 py-3 rounded-full transition-all duration-300 ${
              isLight || scrolled 
                ? 'bg-white/95 backdrop-blur-md shadow-sm' 
                : 'bg-white/10 backdrop-blur-md border border-white/20'
            }`}>
              <ul className="flex items-center space-x-6">
                {navLinks.map((item) => (
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
              </ul>
            </nav>
            
            {/* Book an Appointment Button */}
            <BookingButton 
              className={`px-5 py-3 rounded-full font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center ${
                isLight || scrolled
                  ? 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]'
                  : 'bg-white text-[#8B5C9E] hover:bg-white/90'
              }`}
              icon={<Calendar className="w-5 h-5 mr-2" />}
              text="Book an Appointment"
            />
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-md focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={isLight || scrolled ? 'text-[#8B5C9E]' : 'text-white'} size={24} />
            ) : (
              <Menu className={isLight || scrolled ? 'text-[#8B5C9E]' : 'text-white'} size={24} />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={`lg:hidden ${
          isLight || scrolled ? 'bg-white' : 'bg-black/90 backdrop-blur-md'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-md font-medium ${
                    isLight || scrolled 
                      ? 'text-gray-800 hover:bg-gray-100 hover:text-[#8B5C9E]' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <BookingButton 
                  className={`w-full py-3 px-6 rounded-md font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
                    isLight || scrolled
                      ? 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]'
                      : 'bg-white text-[#8B5C9E] hover:bg-white/90'
                  }`}
                  icon={<Calendar className="w-5 h-5 mr-2" />}
                  text="Book an Appointment"
                />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 