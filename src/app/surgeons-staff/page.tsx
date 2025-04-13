'use client';

// import { Metadata } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import csv from 'csv-parser';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { StaffCard } from '@/app/surgeons-staff/components/StaffCard';
import { UserPlus, Users, Award, Phone, ArrowRight } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import { Readable } from 'stream';
import HeroSection from '@/components/ui/HeroSection';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/booking/BookingModal';
import { cn } from '@/lib/utils';

// Hardcoded staff data based on surgeons.html
const allStaff = [
  // Director
  {
    slug: 'dr-naveen-kumar-l-v',
    name: 'Dr. Naveen Kumar LV',
    title: 'MBBS, MS Orth (India), FRCS Orth (Eng), MCh Hip & Knee (UK), MSc Orth (UK), Dip SICOT (Italy), FEBOT (Portugal), MRCGP (UK), Dip FIFA SM (Switzerland) (FSEM (UK))',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/313414809_424129516595915_5712394841841282653_n-500x500.jpg',
    role: 'Director',
  },
  // Associate Consultant
  {
    slug: 'dr-sameer-km',
    name: 'Dr. Sameer KM',
    title: 'Associate Consultant – Sports Orthopedics Institute & Manipal Hospitals, Sarjapur Road',
    qualifications: 'MBBS, MS(Ortho), DNB (Ortho), Dip.FIFA(SM)(Switzerland), Dip SICOT(Belgium), Fellowship in Arthroscopy & Arthroplasty (SOI)',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/Sameer-Photo-500x500.webp',
    role: 'Consultant',
  },
  // Sports Psychologist
  {
    slug: 'shama-kellogg',
    name: 'Shama Kellogg',
    title: 'Sports Psychologist',
    qualifications: 'MSc (Sports Psychology), MA (Clinical Psychology) Sterling University, Scotland, UK',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/Shama-Kellog-500x500.webp',
    role: 'Psychologist',
  },
  // Fellows
  {
    slug: 'dr-aravind-naik',
    name: 'Dr. Aravind Naik',
    title: 'MBBS, MS Orth',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/IMG-20240923-WA0008-500x500.jpg',
    role: 'Fellow',
  },
  {
    slug: 'dr-akash-rathod',
    name: 'Dr. Akash Rathod',
    title: 'MBBS, MS Orth',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/IMG-20241013-WA0023-500x500.jpg',
    role: 'Fellow',
  },
  // Physiotherapists
  {
    slug: 'atharva-mishra',
    name: 'Atharva Mishra',
    title: 'MPT (Sports), CDNT (HPE, London), KCAT',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/Dr-Atharva-Mishra-500x500.webp',
    role: 'Physiotherapist',
  },
  {
    slug: 'anjali-khandelwal',
    name: 'Anjali Khandelwal',
    title: 'MPT (Orthopedics), CDNT (HPE, London)',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/Dr.-Anjali-Khandelwal-500x500.webp',
    role: 'Physiotherapist',
  },
  // Staff
  {
    slug: 'nihal-jayaram',
    name: 'Nihal Jayaram',
    title: 'Manager',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/qfweg-500x500.webp', // Placeholder
    role: 'Staff',
  },
  {
    slug: 'archana',
    name: 'Archana',
    title: 'Front Desk Executive & Secretary',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/qfweg-500x500.webp', // Placeholder
    role: 'Staff',
  },
  {
    slug: 'jenifer',
    name: 'Jenifer',
    title: 'Front Desk Executive',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/qfweg-500x500.webp', // Placeholder
    role: 'Staff',
  },
  {
    slug: 'amala',
    name: 'Amala',
    title: 'Qualified Nurse',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/qfweg-500x500.webp', // Placeholder
    role: 'Staff',
  },
   {
    slug: 'soumen-staff', // Differentiating slug
    name: 'Soumen',
    title: 'Qualified Nurse',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/qfweg-500x500.webp', // Placeholder
    role: 'Staff',
  },
  {
    slug: 'laljith',
    name: 'Laljith',
    title: 'Front Desk Executive',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/qfweg-500x500.webp', // Placeholder
    role: 'Staff',
  },
  // Manipal Hospital Staff
  {
    slug: 'arjun-mannattil',
    name: 'Arjun Mannattil',
    title: 'BCom with CA, (MBA) Financial Coordinator & Admission Facilitator Phone: 9916113224',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/IMG-20241013-WA0027-500x500.jpg',
    role: 'ManipalStaff',
  },
  {
    slug: 'soumen-parikshit',
    name: 'Soumen Parikshit',
    title: 'Front Desk Executive & Qualified Nursing Support',
    imageUrl: 'https://sportsorthopedics.in/wp-content/uploads/2025/01/qfweg-500x500.webp', // Placeholder
    role: 'ManipalStaff',
  },
];

// Helper function to group staff by role
const groupStaffByRole = (staffList: typeof allStaff) => {
  return staffList.reduce((acc, staff) => {
    const role = staff.role || 'Staff'; // Default role
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(staff);
    return acc;
  }, {} as Record<string, typeof allStaff>);
};

// Define roles eligible for filtering
const filterableRoles = ['Psychologist', 'Fellow', 'Physiotherapist', 'Staff', 'ManipalStaff'];

export default function SurgeonsStaffPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null); // null means 'All'
  const groupedStaff = groupStaffByRole(allStaff);

  // Define section titles and icons based on role
  const sections = [
    { role: 'Director', title: 'Director', icon: Award },
    { role: 'Consultant', title: 'Associate Consultant', icon: Award },
    { role: 'Psychologist', title: 'Sports Psychologist', icon: UserPlus },
    { role: 'Fellow', title: 'Sports Orthopedics Fellows', icon: Users },
    { role: 'Physiotherapist', title: 'Physiotherapists', icon: UserPlus },
    { role: 'Staff', title: 'Clinic Staff', icon: Users },
    { role: 'ManipalStaff', title: 'Manipal Hospital Staff', icon: Users },
  ];

  // Get staff eligible for filtering
  const filterableStaff = allStaff.filter(staff => filterableRoles.includes(staff.role));

  // Filter staff based on the active filter
  const filteredStaff = activeFilter
    ? filterableStaff.filter(staff => staff.role === activeFilter)
    : filterableStaff;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader theme="transparent" />
      
      {/* Hero Section - Replaced with HeroSection component */}
      <HeroSection
        variant="image"
        height="large"
        bgColor="#2E3A59"
        bgImage="/images/team-hero.jpg" // Using the original team image
        title={ // Static title matching homepage style
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-[#8B5C9E]/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-[#8B5C9E]/30">
              OUR DEDICATED TEAM
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              <span className="block">Our Expert</span>
              <span className="block mt-2">Medical Team</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Meet the dedicated surgeons and healthcare professionals who provide exceptional orthopedic care.
            </p>
          </div>
        }
        actions={ // Actions matching homepage style
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
            <Button
              size="lg"
              className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
              onClick={() => setIsBookingModalOpen(true)}
              aria-label="Book an appointment with our specialists"
            >
              <span className="flex items-center justify-center">
                Request a Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 w-full sm:w-auto"
              aria-label="Meet Our Surgeons" 
            >
              <Link href="#director" className="flex items-center"> {/* Link to first section */}
                Meet Our Director
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        }
      >
        {/* No children needed here */}
      </HeroSection>
      
      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 md:py-16">

          {/* --- Featured Personnel Section (Side-by-Side) --- */}
          <section className="mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Render Director Card */}
                  {groupedStaff['Director']?.map(staff => {
                      const sectionInfo = sections.find(s => s.role === staff.role);
                      const SectionIcon = sectionInfo?.icon || Users;
                      return (
                          <div 
                              key={staff.slug} 
                              id={staff.role.toLowerCase()} 
                              className="relative overflow-hidden rounded-xl shadow-xl border border-gray-200 group h-full flex flex-col"
                          >
                              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5C9E]/5 via-white to-white group-hover:from-[#8B5C9E]/10 transition-all duration-500"></div>
                              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500"></div>
                              <div className="relative p-8 flex-grow flex flex-col md:flex-row items-center gap-6">
                                  <div className="flex-shrink-0 w-36 h-36 md:w-40 md:h-40 relative">
                                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#8B5C9E]/20 to-transparent animate-pulse-slow opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                                      <Image
                                          src={staff.imageUrl}
                                          alt={staff.name}
                                          fill
                                          className="rounded-full object-cover object-center shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-500"
                                          sizes="(max-width: 768px) 144px, 160px"
                                          priority
                                      />
                                  </div>
                                  <div className="flex-grow text-center md:text-left">
                                      <div className="mb-3">
                                          <span className="inline-flex items-center bg-[#8B5C9E]/10 text-[#8B5C9E] px-3 py-1 rounded-full text-sm font-medium">
                                              <SectionIcon className="w-4 h-4 mr-1.5" />
                                              {sectionInfo?.title || staff.role}
                                          </span>
                                      </div>
                                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                          {staff.name}
                                      </h2>
                                      <p className="text-sm text-gray-700 mb-3 font-medium">
                                          {staff.title}
                                      </p>
                                      {staff.qualifications && (
                                          <p className="text-xs text-gray-500 italic">
                                              {staff.qualifications}
                                          </p>
                                      )}
                                  </div>
                              </div>
                          </div>
                      );
                  })}

                  {/* Render Consultant Card */}
                  {groupedStaff['Consultant']?.map(staff => {
                     const sectionInfo = sections.find(s => s.role === staff.role);
                     const SectionIcon = sectionInfo?.icon || Users;
                     return (
                          <div 
                              key={staff.slug} 
                              id={staff.role.toLowerCase()} 
                              className="relative overflow-hidden rounded-xl shadow-xl border border-gray-200 group h-full flex flex-col"
                          >
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-white group-hover:from-gray-100/50 transition-all duration-500"></div>
                              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500"></div>
                              <div className="relative p-8 flex-grow flex flex-col md:flex-row items-center gap-6">
                                  <div className="flex-shrink-0 w-36 h-36 md:w-40 md:h-40 relative">
                                       <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#8B5C9E]/15 to-transparent animate-pulse-slow opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                                      <Image
                                          src={staff.imageUrl}
                                          alt={staff.name}
                                          fill
                                          className="rounded-full object-cover object-center shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-500"
                                          sizes="(max-width: 768px) 144px, 160px"
                                      />
                                  </div>
                                  <div className="flex-grow text-center md:text-left">
                                      <div className="mb-3">
                                          <span className="inline-flex items-center bg-[#8B5C9E]/10 text-[#8B5C9E] px-3 py-1 rounded-full text-sm font-medium">
                                              <SectionIcon className="w-4 h-4 mr-1.5" />
                                              {sectionInfo?.title || staff.role}
                                          </span>
                                      </div>
                                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                          {staff.name}
                                      </h2>
                                      <p className="text-sm text-gray-700 mb-3 font-medium">
                                          {staff.title}
                                      </p>
                                      {staff.qualifications && (
                                          <p className="text-xs text-gray-500 italic">
                                              {staff.qualifications}
                                          </p>
                                      )}
                                  </div>
                              </div>
                          </div>
                     );
                  })}
              </div>
          </section>

          {/* --- Filterable Staff Section --- */}
          <section className="mb-16">
              {/* Filter Tags */}
              <div className="flex flex-wrap justify-center gap-3 mb-10 pt-8 border-t border-gray-200">
                  <Button
                      variant={activeFilter === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveFilter(null)}
                      className={cn(
                          "rounded-full transition-all",
                          activeFilter === null ? 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]' : 'border-gray-300 hover:bg-gray-100'
                      )}
                  >
                      All Team Members
                  </Button>
                  {filterableRoles.map(role => {
                      const sectionInfo = sections.find(s => s.role === role);
                      const count = filterableStaff.filter(s => s.role === role).length;
                      if (count === 0) return null; // Don't show filter if no staff have this role
                      
                      return (
                          <Button
                              key={role}
                              variant={activeFilter === role ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveFilter(role)}
                               className={cn(
                                  "rounded-full transition-all",
                                  activeFilter === role ? 'bg-[#8B5C9E] text-white hover:bg-[#7a4f8a]' : 'border-gray-300 hover:bg-gray-100'
                              )}
                          >
                              {sectionInfo?.title || role.replace('ManipalStaff', 'Manipal Staff')} ({count})
                          </Button>
                      );
                  })}
              </div>

              {/* Filtered Staff Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredStaff.map((staff) => {
                      // Role badge styling
                      const roleBadgeStyle = {
                        Psychologist: 'bg-blue-100 text-blue-800',
                        Fellow: 'bg-green-100 text-green-800',
                        Physiotherapist: 'bg-purple-100 text-purple-800',
                        Staff: 'bg-yellow-100 text-yellow-800',
                        ManipalStaff: 'bg-indigo-100 text-indigo-800'
                      }[staff.role] || 'bg-gray-100 text-gray-800';
                      
                      return (
                        // Smaller Staff Card
                        <div 
                          key={staff.slug} 
                          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden text-center transform hover:-translate-y-1 flex flex-col"
                        >
                            <div className="relative aspect-square w-full overflow-hidden flex-shrink-0">
                                <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold z-10 ${roleBadgeStyle}`}>
                                  {staff.role.replace('ManipalStaff','Manipal Staff')} 
                                </div>
                                <Image
                                    src={staff.imageUrl}
                                    alt={staff.name}
                                    fill
                                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-3 flex-grow flex flex-col justify-between">
                                <div> {/* Wrapper for text content */} 
                                    <h3 className="text-base font-semibold text-gray-900 mb-0.5 leading-tight">
                                        {staff.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-snug mb-1">
                                        {staff.title}
                                    </p>
                                </div>
                                {staff.qualifications && (
                                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 italic leading-tight">
                                    {staff.qualifications}
                                  </p>
                                )}
                            </div>
                       </div>
                      );
                    })}
                </div>

                {/* Message if no staff match filter */}
                {filteredStaff.length === 0 && activeFilter && (
                    <div className="text-center text-gray-500 py-10 col-span-full">
                        No team members found for the "{sections.find(s => s.role === activeFilter)?.title || activeFilter}" category.
                    </div>
                )}
          </section>

          {/* Additional Info Section */}
          <section className="bg-white rounded-xl p-8 shadow-md mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Work With the Best in Orthopedic Care</h2>
            <div className="prose max-w-none">
              <p>
                At Sports Orthopedics, our medical team comprises internationally trained and experienced 
                specialists who have achieved excellence in their respective fields. Our surgeons have been 
                recognized with prestigious awards and have pioneered advanced techniques in orthopedic care.
              </p>
              <p>
                We believe in a collaborative approach to patient care, bringing together surgeons, specialists, 
                and support staff to develop comprehensive treatment plans tailored to each patient's unique needs.
              </p>
              <p>
                To schedule a consultation with any of our medical professionals, please 
                <a href="/contact" className="text-[#8B5C9E] hover:text-[#7a4f8a] mx-1">contact us</a>
                or call us directly at <strong>+91-6364538660</strong>.
              </p>
            </div>
          </section>

      </main>
      
      <SiteFooter />

      {/* Booking Modal Added */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
} 