'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      <div className="container mx-auto px-4 flex justify-center">
        {/* Centered Navigation Bar */}
        <nav className={`px-8 py-3 rounded-full transition-all duration-300 ${
          isLight || scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white/10 backdrop-blur-md border border-white/20'
        }`}>
          <ul className="flex items-center space-x-8">
            {/* Updated links to be more generic/relevant */}
            {[
              { name: 'Home', href: '/' },
              { name: 'Bone & Joint School', href: '/bone-joint-school' },
              { name: 'Procedures', href: '/procedure-surgery' },
              { name: 'Publications', href: '/publications' },
              { name: 'Pages', href: '/pages' },
              { name: 'Categories', href: '/categories' },
              { name: 'About', href: '/about' },
              { name: 'Contact', href: '/contact' }
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
          </ul>
        </nav>
      </div>
    </header>
  );
} 