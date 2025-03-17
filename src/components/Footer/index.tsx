import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { useNewsletterSubscription } from '../../lib/hooks/useSupabaseData';

const navigation = {
  top: [
    { name: 'Home', href: '/' },
    { name: 'Team Building', href: '/team-building' },
    { name: 'Team Getaways', href: '/team-getaways' },
    { name: 'Stays', href: '/stays' },
    { name: 'Vendors', href: '/vendors' }
  ],
  bottom: [
    { name: 'About', href: '/about' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' }
  ],
  social: [
    { name: 'Whatsapp', href: '#', aria: 'Whatsapp link' },
    { name: 'Instagram', href: '#', aria: 'Instagram link' }
  ]
};

const NavLink = ({ href, children, aria }: { href: string; children: string; aria?: string }) => (
  <a 
    href={href}
    aria-label={aria || `Navigate to ${children}`}
    className="text-[#636363] hover:text-[#ff513c] transition-colors duration-300 font-['DM Sans'] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff513c] focus:ring-opacity-50 rounded"
  >
    {children}
  </a>
);

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [email, setEmail] = useState('');
  const { subscribe, loading, error, success } = useNewsletterSubscription();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Ensure year stays current even if component doesn't remount
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      await subscribe(email);
      if (!error) {
        setEmail(''); // Clear input on success
      }
    }
  };

  return (
    <footer 
      ref={ref}
      className="relative w-full px-4 md:px-8 lg:px-12 py-12 bg-white"
      aria-label="Site footer"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Modern responsive layout using flex and grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 gap-x-8">
          {/* Left Side - Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <h2 className="text-4xl md:text-[40px] font-bold leading-[1.2] bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent font-['Outfit']">
              Transform Your<br />
              Team Into<br />
              Champions
            </h2>
          </motion.div>

          {/* Right Side - All Other Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full flex flex-col md:items-end space-y-6"
          >
            {/* Logo and Description */}
            <div className="space-y-3 md:text-right">
              <motion.a
                href="/"
                className="block w-[120px] md:ml-auto"
                aria-label="Trebound home"
              >
                <img 
                  src="https://cdn.prod.website-files.com/61ead40fcee1ea7e99aa2b1f/66f54b982ce090736e4e4d1c_Tewbound%20Hover.png"
                  loading="lazy"
                  alt="Trebound"
                  className="w-full h-auto"
                />
              </motion.a>
              <p className="text-sm text-[#636363] font-['DM Sans'] leading-relaxed">
                Team-building to Inspire Creativity, Innovation, and Collaboration with team Trebound.
              </p>
            </div>

            {/* Newsletter Subscription with accessibility improvements */}
            <form onSubmit={handleSubmit} className="relative w-full max-w-sm mt-1">
              <label htmlFor="email-input" className="sr-only">Email address</label>
              <input
                id="email-input"
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "email-error" : success ? "email-success" : undefined}
                className="w-full pr-20 py-2.5 px-4 bg-[#f1f1f1] rounded-[8px] border-none outline-none font-['DM Sans'] text-sm focus:ring-2 focus:ring-[#FF4C39] focus:ring-opacity-50 disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-0 top-0 h-full px-4 text-[#FF4C39] hover:text-[#ff6b57] transition-colors duration-300 font-['DM Sans'] text-sm font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FF4C39] focus:ring-opacity-50 rounded-r-[8px]"
                aria-label={loading ? "Signing up to newsletter" : "Sign up to newsletter"}
              >
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
              {error && (
                <p id="email-error" className="mt-1 text-xs text-red-500 font-['DM Sans']" role="alert">{error}</p>
              )}
              {success && (
                <p id="email-success" className="mt-1 text-xs text-green-500 font-['DM Sans']" role="status">Successfully subscribed to newsletter!</p>
              )}
            </form>

            {/* Navigation Links with improved layout for mobile and desktop */}
            <nav className="w-full space-y-4 md:space-y-2" aria-label="Footer navigation">
              <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-2">
                {navigation.top.map((item) => (
                  <NavLink key={item.name} href={item.href}>{item.name}</NavLink>
                ))}
              </div>
              <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-2">
                {navigation.bottom.map((item) => (
                  <NavLink key={item.name} href={item.href}>{item.name}</NavLink>
                ))}
              </div>
            </nav>

            {/* Social Links with improved accessibility */}
            <div className="flex gap-4 mt-1" aria-label="Social media links">
              {navigation.social.map((item) => (
                <NavLink key={item.name} href={item.href} aria={item.aria}>{item.name}</NavLink>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer Bottom with dynamic year */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 pt-6 border-t border-gray-100 flex justify-start"
        >
          <p className="text-sm text-[#636363] font-['DM Sans']">© All rights reserved. Trebound {currentYear}</p>
        </motion.div>
      </div>

      {/* Improved Scroll to Top Button with accessibility */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top of page"
        className="fixed bottom-8 right-8 rounded-full w-12 h-12 bg-[#1a365d] hover:bg-[#2d4a7c] text-white transition-colors duration-300 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ff513c] focus:ring-opacity-50 z-50"
      >
        <span aria-hidden="true">↑</span>
      </button>
    </footer>
  );
};

export default Footer;
