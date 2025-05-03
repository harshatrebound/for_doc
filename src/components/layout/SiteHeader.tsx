'use client';

import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Menu, X, ChevronDown, ChevronRight, Activity, Users, Bookmark } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import { motion, AnimatePresence } from 'framer-motion';
import { getBoneJointTopics } from '@/app/bone-joint-school/actions';

interface SiteHeaderProps {
  theme?: 'light' | 'transparent' | 'fixed' | 'default';
  className?: string;
}

interface BoneJointTopicCategory {
  slug: string;
  title: string;
}

// Add a new BoneJointTopic interface to match what's returned from getBoneJointTopics
interface BoneJointTopic {
  slug: string;
  title: string;
  imageUrl: string;
  summary: string;
  category?: string;
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
  const [boneJointCategories, setBoneJointCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [boneJointTopics, setBoneJointTopics] = useState<BoneJointTopic[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Fetch categories and topics on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        // Fetch topics and categories
        const { categories, topics } = await getBoneJointTopics();
        
        // Only add 'All' if it's not already in the categories
        const categoriesWithAll = 
          categories.includes('All') 
            ? categories 
            : ['All', ...categories.filter((cat: string | null) => cat)];
            
        setBoneJointCategories(categoriesWithAll);
        setBoneJointTopics(topics);
      } catch (error) {
        console.error("Failed to fetch Bone & Joint School categories:", error);
        setBoneJointCategories(['All']); // Fallback
        setBoneJointTopics([]);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  const isTransparent = theme === 'transparent';
  const isLight = theme === 'light' || (theme === 'transparent' && scrolled);
  const isFixed = theme === 'fixed';

  // Main navigation links
  const mainNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Surgeons & Staff', href: '/surgeons-staff' },
    { name: 'Procedures', href: '/procedure-surgery' },
    // Bone & Joint School is now handled separately as a dropdown
  ];

  // Resources dropdown items
  const resourcesLinks = [
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
    // Add Bone & Joint School section for mobile
    { section: 'Bone & Joint School' },
    ...(boneJointCategories.map((category: string) => ({
      name: category,
      href: `/bone-joint-school${category === 'All' ? '' : `?category=${encodeURIComponent(category)}`}`
    }))),
    { section: 'Resources' },
    ...resourcesLinks,
    { section: 'Media' },
    ...mediaLinks,
  ];

  // Enhanced mouse over handlers with delay
  const handleMouseEnter = (dropdown: string) => {
    // Only activate hover behavior on desktop
    if (!isMobile.current) {
      // Clear any existing timeout
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        setLeaveTimeout(null);
      }
      setActiveDropdown(dropdown);
      // Don't reset category on mouse enter to allow direct movement to submenu
    }
  };

  const handleMouseLeave = () => {
    // Only deactivate hover behavior on desktop
    if (!isMobile.current) {
      // Set a timeout to delay menu closing
      const timeout = setTimeout(() => {
        setActiveDropdown(null);
        setActiveCategory(null);
      }, 300); // 300ms delay gives enough time to move to submenu
      
      setLeaveTimeout(timeout);
    }
  };

  // Handle category hover with delay
  const handleCategoryMouseEnter = (category: string) => {
    if (!isMobile.current) {
      // Clear any existing timeout
      if (leaveTimeout) {
        clearTimeout(leaveTimeout);
        setLeaveTimeout(null);
      }
      setActiveCategory(category);
    }
  };

  // Handle menu container mouse enter - clear any closing timeout
  const handleMenuContainerMouseEnter = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      setLeaveTimeout(null);
    }
  };

  // Get category icon based on name
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'knee':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'shoulder':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'hip':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'elbow':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'foot & ankle':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'hand & wrist':
        return <Activity className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      case 'all':
        return <Bookmark className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
      default:
        return <Bookmark className="h-4 w-4 mr-2 text-[#8B5C9E] opacity-70" />;
    }
  };

  // Get topics for a specific category
  const getTopicsForCategory = (category: string) => {
    if (category === 'All') {
      return boneJointTopics;
    }
    return boneJointTopics.filter(topic => topic.category === category);
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
          backgroundColor: isTransparent ? `rgba(46, 58, 89, var(--header-bg-opacity))` : '',
          backdropFilter: isTransparent ? `blur(var(--header-blur))` : '',
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
        } as CSSProperties}
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
                  
                  {/* Bone & Joint School Dropdown with improved hover handling */}
                  <li 
                    className="relative mr-8"
                    onMouseEnter={() => handleMouseEnter('boneJoint')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`font-medium transition-colors duration-300 flex items-center group ${
                        isTransparent && !scrolled 
                          ? 'text-white hover:text-white/80' 
                          : 'text-gray-800 hover:text-[#8B5C9E]'
                      } py-2`}
                      aria-expanded={activeDropdown === 'boneJoint'}
                      aria-haspopup="true"
                      disabled={categoriesLoading}
                    >
                      Bone & Joint School
                      <span className={`flex items-center justify-center ml-2 w-5 h-5 ${
                        isTransparent && !scrolled 
                          ? 'bg-white/20 group-hover:bg-white/30' 
                          : 'bg-gray-100 group-hover:bg-[#8B5C9E]/10'
                      } rounded-full transition-all duration-150 ${activeDropdown === 'boneJoint' ? 'rotate-180' : ''}`}>
                        <ChevronDown className={`w-3.5 h-3.5 ${
                          isTransparent && !scrolled ? 'text-white' : 'text-[#8B5C9E]'
                        }`} />
                      </span>
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-[#8B5C9E]'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                    
                    {activeDropdown === 'boneJoint' && !categoriesLoading && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100 max-h-[calc(100vh-200px)] overflow-visible"
                        onMouseEnter={handleMenuContainerMouseEnter}
                        role="menu"
                        aria-label="Bone & Joint School Categories"
                      >
                        {/* Filter out duplicate "All" entries */}
                        {boneJointCategories
                          .filter((category: string, index: number) => 
                            category !== 'All' || boneJointCategories.indexOf(category) === index
                          )
                          .map((category: string) => (
                          <div 
                            key={category}
                            className="relative group"
                            onMouseEnter={() => handleCategoryMouseEnter(category)}
                            role="none"
                          >
                            <button
                              className={`block w-full text-left px-4 py-2 ${
                                activeCategory === category 
                                  ? 'bg-gray-100 text-[#8B5C9E]' 
                                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#8B5C9E]'
                              } flex justify-between items-center transition-all duration-150`}
                              onClick={() => handleNavigation(`/bone-joint-school${category === 'All' ? '' : `?category=${encodeURIComponent(category)}`}`)}
                              role="menuitem"
                              aria-haspopup={category !== 'All'}
                              aria-expanded={category !== 'All' && activeCategory === category}
                            >
                              <span className="flex items-center">
                                {getCategoryIcon(category)}
                                {category}
                              </span>
                              {category !== 'All' && (
                                <ChevronRight className={`h-4 w-4 transform transition-transform duration-150 ${activeCategory === category ? 'translate-x-1 text-[#8B5C9E]' : 'text-gray-400'}`} />
                              )}
                            </button>

                            {/* Second level dropdown with improved positioning and visual connection */}
                            {activeCategory === category && category !== 'All' && (
                              <div 
                                className="absolute left-full top-0 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100 overflow-y-auto"
                                style={{ 
                                  maxHeight: '60vh'
                                }}
                                role="menu"
                                aria-label={`${category} Topics`}
                                onMouseEnter={handleMenuContainerMouseEnter}
                              >
                                {/* Visual connecting element */}
                                <div 
                                  className="absolute left-0 top-0 w-1 bg-[#8B5C9E] rounded-l"
                                  style={{ 
                                    height: '2.5rem', // Match the height of parent button
                                    transform: 'translateX(-1px)'
                                  }}
                                ></div>
                                
                                {/* Category heading for the submenu */}
                                <div className="px-4 py-2 font-medium text-sm text-[#8B5C9E] border-b border-gray-100 mb-1">
                                  {category} Topics
                                </div>
                                
                                {getTopicsForCategory(category).length > 0 ? (
                                  getTopicsForCategory(category).map((topic: BoneJointTopic) => (
                                    <button
                                      key={topic.slug}
                                      onClick={() => handleNavigation(`/bone-joint-school/${topic.slug}`)}
                                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#8B5C9E] transition-colors duration-150"
                                      role="menuitem"
                                    >
                                      {topic.title}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-gray-500 italic">No topics available</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                  
                  {/* Resources Dropdown - Using hover with delay */}
                  <li 
                    className="relative mr-8"
                    onMouseEnter={() => handleMouseEnter('resources')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
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
                      } rounded-full transition-all duration-150 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`}>
                        <ChevronDown className={`w-3.5 h-3.5 ${
                          isTransparent && !scrolled ? 'text-white' : 'text-[#8B5C9E]'
                        }`} />
                      </span>
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-[#8B5C9E]'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                    
                    {activeDropdown === 'resources' && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                        onMouseEnter={handleMenuContainerMouseEnter}
                        role="menu"
                        aria-label="Resources"
                      >
                        {resourcesLinks.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#8B5C9E] transition-colors duration-150"
                            role="menuitem"
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                  
                  {/* Media Dropdown - Using hover with delay */}
                  <li 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter('media')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
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
                      } rounded-full transition-all duration-150 ${activeDropdown === 'media' ? 'rotate-180' : ''}`}>
                        <ChevronDown className={`w-3.5 h-3.5 ${
                          isTransparent && !scrolled ? 'text-white' : 'text-[#8B5C9E]'
                        }`} />
                      </span>
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${
                        isTransparent && !scrolled ? 'bg-white' : 'bg-[#8B5C9E]'
                      } group-hover:w-full transition-all duration-300`}></span>
                    </button>
                    
                    {activeDropdown === 'media' && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                        onMouseEnter={handleMenuContainerMouseEnter}
                        role="menu"
                        aria-label="Media"
                      >
                        {mediaLinks.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#8B5C9E] transition-colors duration-150"
                            role="menuitem"
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
                text="Book an Appointment"
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
                ariaLabel="Book an Appointment"
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
                  {/* Display main navigation links first */}
                  {mainNavLinks.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                        pathname === item.href ? 'bg-gray-50 text-[#8B5C9E] font-medium' : ''
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}

                  {/* Bone & Joint School Section */}
                  {!categoriesLoading && boneJointCategories.length > 0 && (
                    <div className="mt-4">
                      <div className="px-4 pt-2 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Bone & Joint School
                      </div>

                      {/* "All" category */}
                      <button
                        key="bone-joint-all"
                        onClick={() => handleNavigation('/bone-joint-school')}
                        className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                          pathname === '/bone-joint-school' && !pathname.includes('?category=') 
                            ? 'bg-gray-50 text-[#8B5C9E] font-medium' 
                            : ''
                        }`}
                      >
                        All Topics
                      </button>

                      {/* Categories as expandable sections */}
                      {boneJointCategories.filter(cat => cat !== 'All').map((category) => (
                        <div key={`mobile-category-${category}`} className="relative">
                          <button
                            onClick={() => {
                              if (activeCategory === category) {
                                setActiveCategory(null);
                              } else {
                                setActiveCategory(category);
                              }
                            }}
                            className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors justify-between items-center ${
                              pathname.includes(`?category=${encodeURIComponent(category)}`) 
                                ? 'bg-gray-50 text-[#8B5C9E] font-medium' 
                                : ''
                            }`}
                          >
                            <span>{category}</span>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${activeCategory === category ? 'rotate-180' : ''}`} 
                            />
                          </button>

                          {/* Expanded topics for this category */}
                          {activeCategory === category && (
                            <div className="bg-gray-50">
                              {getTopicsForCategory(category).map(topic => (
                                <button
                                  key={`mobile-topic-${topic.slug}`}
                                  onClick={() => handleNavigation(`/bone-joint-school/${topic.slug}`)}
                                  className={`flex w-full text-left pl-8 pr-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors ${
                                    pathname.includes(topic.slug) 
                                      ? 'bg-gray-100 text-[#8B5C9E] font-medium' 
                                      : ''
                                  }`}
                                >
                                  {topic.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resources Section */}
                  {resourcesLinks.length > 0 && (
                    <div className="mt-4">
                      <div className="px-4 pt-2 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Resources
                      </div>
                      {resourcesLinks.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item.href)}
                          className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                            pathname === item.href ? 'bg-gray-50 text-[#8B5C9E] font-medium' : ''
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Media Section */}
                  {mediaLinks.length > 0 && (
                    <div className="mt-4">
                      <div className="px-4 pt-2 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Media
                      </div>
                      {mediaLinks.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => handleNavigation(item.href)}
                          className={`flex w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors ${
                            pathname === item.href ? 'bg-gray-50 text-[#8B5C9E] font-medium' : ''
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </nav>
              </div>
              
              {/* Drawer Footer - Booking Button */}
              <div className="border-t border-gray-100 p-4">
                <BookingButton 
                  className="w-full py-3 px-4 rounded-md font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]"
                  icon={<Calendar className="w-5 h-5 mr-2" />}
                  text="Book an Appointment"
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