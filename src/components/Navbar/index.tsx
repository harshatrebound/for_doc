import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavLink = ({ label, href, isActive, onClick }: NavLinkProps) => (
  <Link
    to={href}
    onClick={onClick}
    className={`text-base font-medium transition-colors ${
      isActive
        ? 'text-[#FF4C39]'
        : 'text-[#636363] hover:text-[#FF4C39]'
    }`}
  >
    {label}
  </Link>
);

const navItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Destinations',
    href: '/corporate-team-outing-places',
  },
  {
    label: 'Stays',
    href: '/stays',
  },
  {
    label: 'Activities',
    href: '/team-building-activity',
  },
  {
    label: 'Blog',
    href: '/blog',
  },
  {
    label: 'Careers',
    href: '/jobs',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[1400px] h-14 sm:h-16 bg-neutral-50/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-nav z-50">
      <div className="flex items-center justify-between h-full px-4 sm:px-8">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="https://cdn.prod.website-files.com/61ead40fcee1ea7e99aa2b1f/66f54b982ce090736e4e4d1c_Tewbound%20Hover.png"
              alt="Trebound"
              className="w-[100px] sm:w-[120px] h-auto"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-md focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-[#636363] transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#636363] mt-1.5 transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#636363] mt-1.5 transition-transform duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg rounded-b-xl transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-[500px] py-4' : 'max-h-0'}`}>
        <div className="flex flex-col space-y-4 px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
