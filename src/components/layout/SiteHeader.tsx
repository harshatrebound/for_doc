'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Menu, X, ChevronDown } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

interface SiteHeaderProps {
  theme?: 'light' | 'default' | 'fixed';
}

export default function SiteHeader({ theme = 'default' }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = theme === 'light';

  // Main navigation links - reduced to essential items
  const mainNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Surgeons & Staff', href: '/surgeons-staff' },
    { name: 'Procedures', href: '/procedure-surgery' },
  ];

  // Resources dropdown items
  const resourcesLinks = [
    { name: 'Bone & Joint School', href: '/bone-joint-school' },
    { name: 'Clinical Videos', href: '/clinical-videos' },
    { name: 'Publications', href: '/publications' },
  ];
  
  // Media dropdown items
  const mediaLinks = [
    { name: 'Gallery', href: '/gallery' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleDropdownToggle = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  return (
    <>
      <header 
        className={`w-full z-50 transition-all duration-300 mb-16 ${
          scrolled ? 'py-3 bg-white shadow-md' : 'py-4 bg-white shadow-sm'
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
              <span className="font-bold text-xl text-[#8B5C9E]">
                Sports Orthopedics
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <nav className="px-8 py-2 rounded-full transition-all duration-300 bg-gray-50 shadow-sm">
                <ul className="flex items-center space-x-8">
                  {mainNavLinks.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="font-medium transition-colors duration-300 relative group text-gray-800 hover:text-[#8B5C9E] py-2 block"
                      >
                        {item.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5C9E] group-hover:w-full transition-all duration-300"></span>
                      </Link>
                    </li>
                  ))}
                  
                  {/* Resources Dropdown */}
                  <li className="relative">
                    <button
                      onClick={() => handleDropdownToggle('resources')}
                      className="font-medium transition-colors duration-300 flex items-center group text-gray-800 hover:text-[#8B5C9E] py-2"
                      aria-expanded={activeDropdown === 'resources'}
                      aria-haspopup="true"
                    >
                      Resources
                      <span className="flex items-center justify-center ml-2 w-5 h-5 bg-gray-100 rounded-full group-hover:bg-[#8B5C9E]/10">
                        <ChevronDown className="w-3.5 h-3.5 text-[#8B5C9E]" />
                      </span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5C9E] group-hover:w-full transition-all duration-300"></span>
                    </button>
                    
                    {activeDropdown === 'resources' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                        {resourcesLinks.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#8B5C9E]"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                  
                  {/* Media Dropdown */}
                  <li className="relative">
                    <button
                      onClick={() => handleDropdownToggle('media')}
                      className="font-medium transition-colors duration-300 flex items-center group text-gray-800 hover:text-[#8B5C9E] py-2"
                      aria-expanded={activeDropdown === 'media'}
                      aria-haspopup="true"
                    >
                      Media
                      <span className="flex items-center justify-center ml-2 w-5 h-5 bg-gray-100 rounded-full group-hover:bg-[#8B5C9E]/10">
                        <ChevronDown className="w-3.5 h-3.5 text-[#8B5C9E]" />
                      </span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8B5C9E] group-hover:w-full transition-all duration-300"></span>
                    </button>
                    
                    {activeDropdown === 'media' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                        {mediaLinks.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#8B5C9E]"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                </ul>
              </nav>
              
              {/* Book an Appointment Button */}
              <BookingButton 
                className="ml-6 px-6 py-3 rounded-full font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]"
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
                <X className="text-[#8B5C9E]" size={24} />
              ) : (
                <Menu className="text-[#8B5C9E]" size={24} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation - reorganized with expandable sections */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 mt-2">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {/* Main Links */}
                {mainNavLinks.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className="px-4 py-3 rounded-md font-medium text-gray-800 hover:bg-gray-100 hover:text-[#8B5C9E]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Resources Section */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={() => handleDropdownToggle('mobile-resources')}
                    className="w-full flex justify-between items-center px-4 py-3 rounded-md font-medium text-gray-800 hover:bg-gray-100"
                  >
                    <span>Resources</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${
                      activeDropdown === 'mobile-resources' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'mobile-resources' && (
                    <div className="pl-4">
                      {resourcesLinks.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-[#8B5C9E]"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Media Section */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => handleDropdownToggle('mobile-media')}
                    className="w-full flex justify-between items-center px-4 py-3 rounded-md font-medium text-gray-800 hover:bg-gray-100"
                  >
                    <span>Media</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${
                      activeDropdown === 'mobile-media' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'mobile-media' && (
                    <div className="pl-4">
                      {mediaLinks.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-[#8B5C9E]"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Book Appointment Button */}
                <div className="pt-4 border-t border-gray-200">
                  <BookingButton 
                    className="w-full py-3 px-6 rounded-md font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]"
                    icon={<Calendar className="w-5 h-5 mr-2" />}
                    text="Book an Appointment"
                  />
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Spacer for fixed header pages - can be used conditionally if needed */}
      {theme === 'fixed' && <div className="h-16 md:h-20 lg:h-24"></div>}
    </>
  );
} 