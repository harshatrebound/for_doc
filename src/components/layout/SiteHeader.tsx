'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Menu, X, ChevronDown } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import { motion, AnimatePresence } from 'framer-motion';

interface SiteHeaderProps {
  theme?: 'light' | 'transparent' | 'fixed' | 'default';
  className?: string;
}

export default function SiteHeader({ theme = 'default', className = '' }: SiteHeaderProps) {
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const isMobile = useRef(false);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Set initial mobile state and attach event listener for window resize
  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.innerWidth < 1024;
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced scroll handler with throttling for better performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      lastScrollY = window.scrollY;
      setScrollY(lastScrollY);
      
      // Simplified scroll detection - make it more immediate on mobile
      if (isMobile.current) {
        setScrolled(lastScrollY > 10);
      } else {
        setScrolled(lastScrollY > 20);
      }
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeaderOpacity(lastScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    const updateHeaderOpacity = (currentScrollY: number) => {
      if (!headerRef.current) return;
      
      // Simplified mobile opacity logic - more immediate/predictable
      if (isMobile.current && theme === 'transparent') {
        // On mobile with transparent theme, quickly transition to solid
        const opacity = currentScrollY > 10 ? 1 : 0.2;
        headerRef.current.style.setProperty('--header-bg-opacity', opacity.toString());
        headerRef.current.style.setProperty('--header-blur', opacity > 0.5 ? '8px' : '0px');
      } else if (!isMobile.current) {
        // Desktop can keep the existing gradual transition
        const maxScroll = 150;
        const baseOpacity = 0;
        const opacity = Math.min(baseOpacity + (currentScrollY / maxScroll), 1);
        headerRef.current.style.setProperty('--header-bg-opacity', opacity.toString());
        const blurValue = Math.min(Math.round(opacity * 10), 8);
        headerRef.current.style.setProperty('--header-blur', `${blurValue}px`);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize values on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  // Close mobile menu and dropdowns when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const isTransparent = theme === 'transparent';
  const isLight = theme === 'light' || (theme === 'transparent' && scrolled);
  const isFixed = theme === 'fixed';

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

  // All mobile navigation links flattened with sections
  const allMobileLinks = [
    { name: 'Home', href: '/' },
    { name: 'Surgeons & Staff', href: '/surgeons-staff' },
    { name: 'Procedures', href: '/procedure-surgery' },
    { section: 'Resources' },
    ...resourcesLinks,
    { section: 'Media' },
    ...mediaLinks,
  ];

  const handleDropdownToggle = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  // Update your Link components to use the router for smoother transitions
  const handleNavigation = (href: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    router.push(href);
  };

  // Helper function to get text and icon colors based on scroll position
  const getTextColor = (baseScrolled = scrolled) => {
    // For mobile with transparent theme, quickly switch to brand color on scroll
    if (isMobile.current && isTransparent) {
      return scrolled ? 'text-[#8B5C9E]' : 'text-white';
    }
    
    // Desktop can keep more nuanced transitions
    if (isTransparent && !baseScrolled) {
      return 'text-white';
    }
    if (isTransparent && scrollY < 150) {
      return scrollY > 100 ? 'text-[#8B5C9E]' : 'text-white';
    }
    return 'text-[#8B5C9E]';
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`w-full z-50 transition-all duration-300 flex items-center ${
          isFixed ? 'fixed top-0 left-0 right-0' : 'absolute top-0 left-0 right-0'
        } ${
          isTransparent ? 'bg-opacity-var backdrop-blur-var' : 'bg-white'
        } ${className}`}
        style={{
          // CSS variables will be set via JS for dynamic opacity and blur
          '--header-bg-opacity': '0',
          '--header-blur': '0px',
          height: scrolled ? 'var(--header-height-scrolled, 72px)' : 'var(--header-height, 88px)',
          backgroundColor: isTransparent ? 'rgba(46, 58, 89, var(--header-bg-opacity))' : '',
          backdropFilter: isTransparent ? 'blur(var(--header-blur))' : '',
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
        } as React.CSSProperties}
      >
        <div className="container mx-auto px-4 flex items-center h-full">
          <div className="flex items-center justify-between w-full">
            {/* Logo and Brand - Webflow-style implementation */}
            <div className="flex items-center">
              <button 
                onClick={() => handleNavigation('/')} 
                className="group flex items-start space-x-3"
                aria-label="Go to homepage"
              >
                <div className="relative h-[44px] w-[44px] md:h-[52px] md:w-[52px] overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md">
                  <Image
                    src="/logo.jpg"
                    alt=""
                    width={78}
                    height={78}
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex flex-col justify-start text-left">
                  <span className={`font-bold text-sm md:text-base leading-tight tracking-tight transition-colors duration-300 ${getTextColor()}`}>
                    Sports Orthopedics
                  </span>
                  <span className={`font-medium text-xs md:text-sm leading-tight transition-colors duration-300 ${getTextColor()}`}>
                    Institute
                  </span>
                </div>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <nav className={`px-8 py-2 rounded-full transition-all duration-300 ${
                isTransparent && !scrolled 
                  ? 'bg-white/10 backdrop-blur-sm' 
                  : scrollY > 50 ? 'bg-white/80 backdrop-blur-sm' : 'bg-gray-50'
              }`}>
                <ul className="flex items-center">
                  {mainNavLinks.map((item) => (
                    <li key={item.name} className="mr-8">
                      <button
                        onClick={() => handleNavigation(item.href)}
                        className={`font-medium transition-colors duration-300 relative group ${
                          isTransparent && !scrolled 
                            ? 'text-white hover:text-white/80' 
                            : 'text-gray-800 hover:text-[#8B5C9E]'
                        } py-2 block`}
                      >
                        {item.name}
                        <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                          isTransparent && !scrolled ? 'bg-white' : 'bg-[#8B5C9E]'
                        } group-hover:w-full transition-all duration-300`}></span>
                      </button>
                    </li>
                  ))}
                  
                  {/* Resources Dropdown */}
                  <li className="relative mr-8">
                    <button
                      onClick={() => handleDropdownToggle('resources')}
                      className={`font-medium transition-colors duration-300 flex items-center group ${
                        isTransparent && !scrolled 
                          ? 'text-white hover:text-white/80' 
                          : 'text-gray-800 hover:text-[#8B5C9E]'
                      } py-2`}
                      aria-expanded={activeDropdown === 'resources'}
                      aria-haspopup="true"
                    >
                      Resources
                      <span className={`flex items-center justify-center ml-2 w-5 h-5 ${
                        isTransparent && !scrolled 
                          ? 'bg-white/20 group-hover:bg-white/30' 
                          : 'bg-gray-100 group-hover:bg-[#8B5C9E]/10'
                      } rounded-full`}>
                        <ChevronDown className={`w-3.5 h-3.5 ${
                          isTransparent && !scrolled ? 'text-white' : 'text-[#8B5C9E]'
                        }`} />
                      </span>
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-[#8B5C9E]'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                    
                    {activeDropdown === 'resources' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                        {resourcesLinks.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#8B5C9E]"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                  
                  {/* Media Dropdown */}
                  <li className="relative">
                    <button
                      onClick={() => handleDropdownToggle('media')}
                      className={`font-medium transition-colors duration-300 flex items-center group ${
                        isTransparent && !scrolled 
                          ? 'text-white hover:text-white/80' 
                          : 'text-gray-800 hover:text-[#8B5C9E]'
                      } py-2`}
                      aria-expanded={activeDropdown === 'media'}
                      aria-haspopup="true"
                    >
                      Media
                      <span className={`flex items-center justify-center ml-2 w-5 h-5 ${
                        isTransparent && !scrolled 
                          ? 'bg-white/20 group-hover:bg-white/30' 
                          : 'bg-gray-100 group-hover:bg-[#8B5C9E]/10'
                      } rounded-full`}>
                        <ChevronDown className={`w-3.5 h-3.5 ${
                          isTransparent && !scrolled ? 'text-white' : 'text-[#8B5C9E]'
                        }`} />
                      </span>
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-[#8B5C9E]'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                    
                    {activeDropdown === 'media' && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                        {mediaLinks.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-[#8B5C9E]"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                </ul>
              </nav>
              
              {/* Book an Appointment Button */}
              <BookingButton 
                className={`ml-6 px-6 py-3 rounded-full font-medium transition-colors duration-300 shadow-sm hover:shadow-md flex items-center ${
                  isTransparent && scrollY < 50
                    ? 'bg-white text-[#8B5C9E] hover:bg-white/90'
                    : 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]'
                }`}
                icon={<Calendar className="w-5 h-5 mr-2" />}
                text="Request Consultation"
              />
            </div>
            
            {/* Mobile: Booking & Menu Buttons */}
            <div className="flex items-center space-x-2 lg:hidden">
              {/* Mobile Booking Button (compact) */}
              <BookingButton 
                className={`px-3 py-2 rounded-full font-medium transition-colors duration-300 shadow-sm hover:shadow-md flex items-center ${
                  isTransparent && !scrolled
                    ? 'bg-white text-[#8B5C9E] hover:bg-white/90'
                    : 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]'
                }`}
                icon={<Calendar className="w-4 h-4" />}
                text=""
                ariaLabel="Request consultation"
              />
              
              {/* Mobile Menu Button - with consistent styling */}
              <button 
                className={`p-2 rounded-full transition-colors duration-300 ${
                  isTransparent && !scrolled
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <Menu className={`transition-colors duration-300 ${
                  isTransparent && !scrolled ? 'text-white' : 'text-[#8B5C9E]'
                }`} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] max-w-[80vw] bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                <div className="flex items-start space-x-3">
                  <div className="relative h-[44px] w-[44px] overflow-hidden shadow-sm">
                    <Image
                      src="/logo.jpg"
                      alt=""
                      width={78}
                      height={78}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-start text-left">
                    <span className="font-bold text-sm leading-tight tracking-tight text-[#8B5C9E]">
                      Sports Orthopedics
                    </span>
                    <span className="font-medium text-xs leading-tight text-[#8B5C9E]">
                      Institute
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-[#8B5C9E]" />
                </button>
              </div>
              
              {/* Drawer Content - Navigation */}
              <div className="flex-1 overflow-y-auto">
                <nav className="py-4">
                  {allMobileLinks.map((item, index) => {
                    if ('section' in item) {
                      return (
                        <div key={`section-${index}`} className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                          {item.section}
                        </div>
                      );
                    }
                    
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigation(item.href)}
                        className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                          pathname === item.href ? 'bg-gray-50 text-[#8B5C9E] font-medium' : ''
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              {/* Drawer Footer - Booking Button */}
              <div className="border-t border-gray-100 p-4">
                <BookingButton 
                  className="w-full py-3 px-4 rounded-md font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]"
                  icon={<Calendar className="w-5 h-5 mr-2" />}
                  text="Request Consultation"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Header spacing element - only needed for pages without hero sections that overlay the header */}
      {!isTransparent && (
        <div className={`w-full ${isFixed ? 'h-16 md:h-16 lg:h-20' : 'h-16 md:h-16 lg:h-20'}`}></div>
      )}
    </>
  );
} 