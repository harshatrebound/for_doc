'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Menu, X, ChevronDown } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

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
      
      if (isMobile.current) {
        // Use a lower threshold for mobile devices
        setScrolled(lastScrollY > 10);
      } else {
        // Use a higher threshold for desktop
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
      
      // Calculate opacity based on scroll position
      let opacity = 0;
      const maxScroll = isMobile.current ? 80 : 150;
      
      if (theme === 'transparent') {
        // Start with a slight base opacity on mobile for better visibility
        const baseOpacity = isMobile.current ? 0.2 : 0;
        opacity = Math.min(baseOpacity + (currentScrollY / maxScroll), 1);
      } else {
        opacity = 1; // Non-transparent headers are always solid
      }
      
      // Apply the calculated opacity to the header background
      headerRef.current.style.setProperty('--header-bg-opacity', opacity.toString());
      
      // Dynamically adjust the blur effect
      const blurValue = Math.min(Math.round(opacity * 10), 8);
      headerRef.current.style.setProperty('--header-blur', `${blurValue}px`);
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
    if (isTransparent && !baseScrolled) {
      return 'text-white';
    }
    if (isTransparent && scrollY < 150) {
      // Gradual text color transition between white and purple
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
          mobileMenuOpen ? 'bg-white' : isTransparent ? 'bg-opacity-var backdrop-blur-var' : 'bg-white'
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
            
            {/* Mobile Menu Button - larger target area */}
            <button 
              className="lg:hidden p-3 rounded-md transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className={`transition-colors duration-300 ${
                  mobileMenuOpen ? 'text-[#8B5C9E]' : getTextColor()
                }`} size={24} />
              ) : (
                <Menu className={`transition-colors duration-300 ${getTextColor()}`} size={24} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation - sliding drawer style for better UX */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden transition-all duration-300">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {/* Main Links */}
                {mainNavLinks.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      handleNavigation(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-md font-medium text-gray-800 hover:bg-gray-100 hover:text-[#8B5C9E] transition-colors duration-200 text-left"
                  >
                    {item.name}
                  </button>
                ))}
                
                {/* Resources Section */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={() => handleDropdownToggle('mobile-resources')}
                    className="w-full flex justify-between items-center px-4 py-3 rounded-md font-medium text-gray-800 hover:bg-gray-100 transition-colors duration-200 text-left"
                  >
                    <span>Resources</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                      activeDropdown === 'mobile-resources' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'mobile-resources' && (
                    <div className="pl-4 animate-fadeIn">
                      {resourcesLinks.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            handleNavigation(item.href);
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full px-4 py-3 rounded-md text-gray-600 hover:bg-gray-100 hover:text-[#8B5C9E] transition-colors duration-200 text-left"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Media Section */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => handleDropdownToggle('mobile-media')}
                    className="w-full flex justify-between items-center px-4 py-3 rounded-md font-medium text-gray-800 hover:bg-gray-100 transition-colors duration-200 text-left"
                  >
                    <span>Media</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                      activeDropdown === 'mobile-media' ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeDropdown === 'mobile-media' && (
                    <div className="pl-4 animate-fadeIn">
                      {mediaLinks.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            handleNavigation(item.href);
                            setMobileMenuOpen(false);
                          }}
                          className="block w-full px-4 py-3 rounded-md text-gray-600 hover:bg-gray-100 hover:text-[#8B5C9E] transition-colors duration-200 text-left"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Book Appointment Button */}
                <div className="pt-4 border-t border-gray-200">
                  <BookingButton 
                    className="w-full py-4 px-6 rounded-md font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]"
                    icon={<Calendar className="w-5 h-5 mr-2" />}
                    text="Request Consultation"
                  />
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Header spacing element - only needed for pages without hero sections that overlay the header */}
      {!isTransparent && (
        <div className={`w-full ${isFixed ? 'h-16 md:h-16 lg:h-20' : 'h-16 md:h-16 lg:h-20'}`}></div>
      )}
    </>
  );
} 