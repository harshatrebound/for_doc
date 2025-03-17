import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabaseClient';
import SkipSearchPopup from '../../components/SkipSearchPopup';
import TestimonialsSection from '../../components/TestimonialsSection';
import ContactSection from '../../components/ContactSection';
import PartnersSection from '../../components/PartnersSection';

// Gallery Modal Component
const GalleryModal = ({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex = 0 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  images: Array<{ id: number; url: string; alt: string }>; 
  initialIndex?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onClose}
          className="text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>
      
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          className="max-h-[80vh] max-w-full object-contain"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={goToPrevious}
              className="absolute left-2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
            >
              <FiChevronLeft size={24} />
            </button>
            
            <button 
              onClick={goToNext}
              className="absolute right-2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-black/50 px-4 py-2 rounded-full text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activity, setActivity] = useState<any>(null);
  const [similarActivities, setSimilarActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [isSkipSearchOpen, setIsSkipSearchOpen] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (data) {
          setActivity({
            ...data,
            images: [data.main_image].filter(Boolean),
            description: data.activity_description?.replace(/<[^>]*>/g, '') || ''
          });

          // Fetch similar activities based on activity_type
          const { data: similarData, error: similarError } = await supabase
            .from('activities')
            .select('*')
            .eq('activity_type', data.activity_type)
            .neq('slug', slug)
            .limit(3);

          if (!similarError && similarData) {
            setSimilarActivities(similarData);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activity:', error);
        setLoading(false);
      }
    };

    if (slug) {
      fetchActivity();
    }
  }, [slug]);

  const openGallery = (index: number) => {
    setGalleryInitialIndex(index);
    setIsGalleryOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#FF4C39] border-r-[#FF4C39] border-b-[#FFB573] border-l-[#FFB573] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-[#636363]">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-28 pb-12 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Activity not found</h1>
          <p className="mt-2 text-gray-600">The activity you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/team-building-activity"
            className="inline-block mt-4 text-[#FF4C39] hover:text-[#FF7B5F]"
          >
            Browse all activities
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Format gallery images for the modal
  const galleryImages = activity.images.map((url: string, index: number) => ({
    id: index,
    url,
    alt: `${activity.name} - Image ${index + 1}`
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <GalleryModal
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            images={galleryImages}
            initialIndex={galleryInitialIndex}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 md:px-8 lg:px-16 max-w-[1448px] mx-auto relative bg-white">
        <div className="mb-8">
          <Link 
            to="/team-building-activity" 
            className="inline-flex items-center text-[#1a1a1a] hover:text-[#FF4C39] transition-colors font-medium"
          >
            <FiArrowLeft className="mr-2" />
            All Activities
          </Link>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-8 font-['Outfit']">
          {activity.name}
        </h1>
        
        {/* Single image layout - full width since we only have main_image */}
        <div className="w-full h-[500px] relative rounded-xl overflow-hidden cursor-pointer" onClick={() => openGallery(0)}>
          <motion.img 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={activity.main_image || 'https://via.placeholder.com/1200x600?text=No+Image+Available'} 
            alt={activity.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </section>

      {/* Activity Details Section */}
      <section className="py-12 px-4 md:px-8 lg:px-16 max-w-[1448px] mx-auto bg-white">
        {/* Content before CTA */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Activity Type */}
              <div className="bg-[#F3F3F3] rounded-[20px] px-12 py-8 hover:shadow-lg transition-shadow duration-300">
                <p className="font-['Urbanist'] text-[#636363] text-[15px] mb-6">Activity Type</p>
                <p className="font-['Outfit'] text-[#FF4C39] text-[32px] font-bold leading-none">
                  {activity.activity_type}
                </p>
              </div>
              
              {/* Group Size */}
              <div className="bg-[#F3F3F3] rounded-[20px] px-12 py-8 hover:shadow-lg transition-shadow duration-300">
                <p className="font-['Urbanist'] text-[#636363] text-[15px] mb-6">Group Size</p>
                <p className="font-['Outfit'] text-[#FF4C39] text-[32px] font-bold leading-none">
                  {activity.group_size}
                </p>
              </div>
              
              {/* Duration */}
              <div className="bg-[#F3F3F3] rounded-[20px] px-12 py-8 hover:shadow-lg transition-shadow duration-300">
                <p className="font-['Urbanist'] text-[#636363] text-[15px] mb-6">Duration</p>
                <p className="font-['Outfit'] text-[#FF4C39] text-[32px] font-bold leading-none">
                  {activity.duration}
                </p>
              </div>
            </div>

            {/* Target Areas Section */}
            {activity.target_areas && (
              <div>
                <h2 className="font-['Outfit'] text-[#1a1a1a] text-[32px] font-bold mb-6">
                  Target Areas
                </h2>
                <div className="flex flex-wrap gap-4">
                  {activity.target_areas.split(',').map((area: string, index: number) => (
                    <div 
                      key={index}
                      className="bg-[#F3F3F3] rounded-full px-6 py-3 font-['DM Sans'] text-[#636363]"
                    >
                      {area.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact on Team Dynamics Section */}
            {activity.impact_on_team_dynamics && (
              <div>
                <h2 className="font-['Outfit'] text-[#1a1a1a] text-[32px] font-bold mb-6">
                  Impact on Team Dynamics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activity.impact_on_team_dynamics
                    .replace(/<\/?ul[^>]*>/g, '')
                    .split('<li>')
                    .slice(1)
                    .map((impact: string, index: number) => {
                      const cleanImpact = impact
                        .replace('</li>', '')
                        .replace(/<\/?strong>/g, '')
                        .split(':');
                      
                      if (cleanImpact.length < 2) return null;
                      
                      const [title, description] = cleanImpact;
                      
                      return (
                        <div key={index} className="bg-[#F3F3F3] rounded-[20px] p-8">
                          <h3 className="font-['Outfit'] text-[#FF4C39] text-xl font-semibold mb-3">
                            {title.trim()}
                          </h3>
                          <p className="font-['DM Sans'] text-[#636363] text-base">
                            {description.trim()}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Activity Blueprint Section */}
            {activity.blueprint && (
              <div>
                <h2 className="font-['Outfit'] text-[#1a1a1a] text-[32px] font-bold mb-6">
                  Activity Blueprint
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div 
                    className="prose max-w-none font-['DM Sans'] text-[#636363]"
                    dangerouslySetInnerHTML={{ __html: activity.blueprint }}
                  />
                  {activity.activity_video && (
                    <div className="relative rounded-[20px] overflow-hidden aspect-video">
                      <iframe
                        src={activity.activity_video.replace('watch?v=', 'embed/')}
                        title="Activity Video"
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:w-[380px] hidden lg:block">
            <div className="sticky top-28">
              <div className="bg-gradient-to-br from-[#003366] via-[#002244] to-[#001a33] rounded-[20px] p-6 text-white">
                <h3 className="text-xl font-bold font-['Outfit'] mb-4">About This Activity</h3>
                <div 
                  className="font-['DM Sans'] text-white/90 text-base space-y-4"
                  dangerouslySetInnerHTML={{ __html: activity.activity_description }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Sections */}
      <div className="w-full">
        {/* Price and Booking Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1448px] mx-auto">
            <div className="bg-gradient-to-br from-[#003366] via-[#002244] to-[#001a33] rounded-[24px] p-10 md:p-16 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-[40px] font-bold font-['Outfit'] leading-tight text-white mb-6">
                    Ready to Experience <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">{activity.name}</span> with Your Team?
                  </h2>
                  <p className="text-white/90 text-lg max-w-2xl mx-auto font-['Inter'] leading-relaxed mb-8">
                    Let us help you plan this engaging activity that your team will remember for years to come.
                  </p>
                  <button
                    onClick={() => setIsSkipSearchOpen(true)}
                    className="px-12 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white font-bold font-['Outfit'] text-lg rounded-[35px] hover:opacity-90 transition-all duration-300 transform hover:-translate-y-[2px] shadow-lg hover:shadow-xl"
                  >
                    Book This Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <PartnersSection />

        {/* Similar Activities Section */}
        <section className="px-4 md:px-8 lg:px-16 py-12">
          <div className="max-w-[1448px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Outfit'] text-[32px] font-bold">
                <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">Similar Experiences</span>
              </h2>
              <p className="font-['DM Sans'] text-[#636363] text-lg">
                Discover how horizons and memories can be expanded with our curated activities
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarActivities.map((similarActivity) => (
                <Link 
                  key={similarActivity.id}
                  to={`/team-building-activity/${similarActivity.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={similarActivity.main_image}
                        alt={similarActivity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-lg sm:text-xl font-semibold mb-1">
                        {similarActivity.name}
                      </h3>
                      <p className="text-sm sm:text-base text-[#636363] mb-4">
                        {similarActivity.tagline || 'Experience the power of collaboration'}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-[#636363] mb-4">
                        <div className="flex items-center gap-2">
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <span>{similarActivity.group_size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{similarActivity.activity_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>{similarActivity.duration}</span>
                        </div>
                      </div>
                      <div className="relative w-full h-[45px] group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#ff4c39] to-[#ffb573] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center gap-2 border border-[#b1b1b1] rounded-lg group-hover:border-transparent transition-colors duration-300">
                          <span className="font-medium text-[#b1b1b1] group-hover:text-white transition-colors duration-300">Explore</span>
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#b1b1b1] group-hover:text-white transition-colors duration-300" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Floating CTA Button */}
      <div className="fixed bottom-24 right-8 z-40">
        <button
          onClick={() => setIsSkipSearchOpen(true)}
          className="px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white font-bold font-['Outfit'] text-lg rounded-full hover:opacity-95 transition-all duration-300 transform hover:-translate-y-[2px] shadow-xl hover:shadow-2xl whitespace-nowrap flex items-center gap-2"
        >
          <span>Book This Activity</span>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
        </button>
      </div>

      {/* Skip Search Popup */}
      <SkipSearchPopup
        isVisible={isSkipSearchOpen}
        onClose={() => setIsSkipSearchOpen(false)}
      />
    </div>
  );
};

export default ActivityDetail; 