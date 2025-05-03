'use client'; // Needed for setIsBookingModalOpen if passed as prop, or keep server-side if modal logic is elsewhere

import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Mail, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useState } from 'react'; // Import useState
import BookingModal from '@/components/booking/BookingModal'; // Import BookingModal

// Define props if Book an Appointment needs to trigger a modal managed by the parent layout/page
// interface SiteFooterProps {
//   onBookAppointmentClick: () => void;
// }

export default function SiteFooter(/*{ onBookAppointmentClick }: SiteFooterProps*/) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // Add state for modal

  // If the booking modal is managed globally or via context, you might not need props here
  // For simplicity, the example below assumes the button links directly or modal logic is elsewhere
  const handleBookAppointment = () => {
    setIsBookingModalOpen(true); // Set state to open modal
    // Option 1: Trigger modal via prop function
    // if (onBookAppointmentClick) onBookAppointmentClick();
    // Option 2: Trigger modal via global state/context (not shown here)
    // Option 3: Navigate to a dedicated booking page
    console.log("Book appointment clicked - implement modal trigger or navigation");
  };

  return (
    <footer className="bg-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Google Map */}
          <div className="relative h-[300px] md:h-auto rounded-xl overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0385700410145!2d77.63429397578755!3d12.972502915594354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae144386d29863%3A0x77af829881bfcf3e!2sSports%20Orthopedics%20Institute!5e0!3m2!1sen!2sin!4v1679891234567!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 border-0"
              title="Sports Orthopedics Institute Location"
            ></iframe>
          </div>

          {/* Useful Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 relative inline-block">
              Useful Links
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5C9E] to-transparent"></div>
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', href: '/' },
                { name: 'Surgeons & Staff', href: '/surgeons-staff' },
                { name: 'Procedures', href: '/procedure-surgery' },
                { name: 'Bone & Joint School', href: '/bone-joint-school' },
                { name: 'Clinical Videos', href: '/clinical-videos' },
                { name: 'Publications', href: '/publications' },
                { name: 'Gallery', href: '/gallery' },
                { name: 'Blogs', href: '/blogs' },
                { name: 'Contact', href: '/contact' },
                { name: 'Book an Appointment', href: '#', action: handleBookAppointment }
              ].map((link) => (
                <li key={link.name}>
                  {link.action ? (
                    <button 
                      onClick={handleBookAppointment}
                      className="text-gray-700 hover:text-[#8B5C9E] transition-colors duration-300 flex items-center"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 text-[#8B5C9E]" />
                      {link.name}
                    </button>
                  ) : (
                    <Link 
                      href={link.href}
                      className="text-gray-700 hover:text-[#8B5C9E] transition-colors duration-300 flex items-center"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 text-[#8B5C9E]" />
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 relative inline-block">
              Contact
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5C9E] to-transparent"></div>
            </h3>
            <div className="space-y-5">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-[#8B5C9E] mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  1084, 2nd Floor, Shirish Foundation, 14th Main, 18th Cross, Sector 3, HSR Layout, Bengaluru - 560102
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-[#8B5C9E] mr-3 flex-shrink-0" />
                  <a href="tel:+916364538660" className="text-gray-700 hover:text-[#8B5C9E] transition-colors duration-300">
                    +91 6364538660
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-transparent mr-3 flex-shrink-0" />{/* Spacer */}
                  <a href="tel:+919008520831" className="text-gray-700 hover:text-[#8B5C9E] transition-colors duration-300">
                    +91 9008520831
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-transparent mr-3 flex-shrink-0" />{/* Spacer */}
                  <a href="tel:+918041276853" className="text-gray-700 hover:text-[#8B5C9E] transition-colors duration-300">
                    +91 80 41276853
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-[#8B5C9E] mr-3 flex-shrink-0" />
                <a href="mailto:sportsorthopedics.in@gmail.com" className="text-gray-700 hover:text-[#8B5C9E] transition-colors duration-300">
                  sportsorthopedics.in@gmail.com
                </a>
              </div>
              
              {/* Social Media Links */}
              <div className="flex space-x-4 pt-4">
                <a href="https://instagram.com/sports.orthopedics" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center hover:bg-[#8B5C9E] group transition-colors duration-300">
                  <Instagram className="w-5 h-5 text-[#8B5C9E] group-hover:text-white transition-colors duration-300" />
                </a>
                <a href="https://facebook.com/SportsOrthopedicsInstitute" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center hover:bg-[#8B5C9E] group transition-colors duration-300">
                  <Facebook className="w-5 h-5 text-[#8B5C9E] group-hover:text-white transition-colors duration-300" />
                </a>
                <a href="https://twitter.com/SportsOrthoInst" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center hover:bg-[#8B5C9E] group transition-colors duration-300">
                  <Twitter className="w-5 h-5 text-[#8B5C9E] group-hover:text-white transition-colors duration-300" />
                </a>
                <a href="https://linkedin.com/company/sports-orthopedics-institute" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-[#8B5C9E]/10 flex items-center justify-center hover:bg-[#8B5C9E] group transition-colors duration-300">
                  <Linkedin className="w-5 h-5 text-[#8B5C9E] group-hover:text-white transition-colors duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            © 2018-{new Date().getFullYear()} Sports Orthopedics Institute and Research Foundation. All Rights Reserved
          </p>
        </div>
      </div>
      {/* Render the BookingModal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </footer>
  );
} 