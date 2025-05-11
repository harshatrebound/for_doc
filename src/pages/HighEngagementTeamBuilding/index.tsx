import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactSection from '../../components/ContactSection';
import TeamSection from '../../components/TeamSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import { useActivities } from '../../lib/hooks/useSupabaseData';
import WhyChooseTreboundSection from '../../components/WhyChooseTreboundSection';
import HowItWorksProcessSection from '../../components/HowItWorksProcessSection';
import type { Activity as SupabaseActivity } from '../../lib/supabaseClient';

// Add constant for items per page
const ITEMS_PER_PAGE = 9;

interface ActivityWithRating extends Omit<SupabaseActivity, 'rating'> {
  rating: string;
}

const HighEngagementTeamBuilding: React.FC = () => {
  const { activities, loading: activitiesLoading, error: activitiesError } = useActivities();
  
  const [heroRef] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activitiesRef] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Filter activities for Virtual or Outbound
  const relevantActivities: ActivityWithRating[] = React.useMemo(() => {
    console.log("Activities received from hook:", activities); // Log raw activities
    const filtered = (activities || [])
      .filter((activity): activity is SupabaseActivity => 
        activity !== null &&
        typeof activity === 'object' &&
        'activity_type' in activity &&
        typeof activity.activity_type === 'string' &&
        // Filter by 'Virtual' OR 'Outbound' (trimmed and lowercased)
        (activity.activity_type.trim().toLowerCase() === 'virtual' || activity.activity_type.trim().toLowerCase() === 'outbound')
      );
    console.log("Filtered activities (Virtual/Outbound):", filtered); // Log after filtering
    return filtered.map(activity => ({
      ...activity,
      rating: '4.9'
    }));
  }, [activities]);

  // Process ALL activities for the new section
  const allDisplayActivities: ActivityWithRating[] = React.useMemo(() => {
    return (activities || [])
      .filter((activity): activity is SupabaseActivity => 
        activity !== null &&
        typeof activity === 'object' // Basic check for valid object
      )
      .map(activity => ({
        ...activity,
        rating: '4.9' // Add default rating
      }));
  }, [activities]);

  // ActivityCard component
  const ActivityCard: React.FC<{ activity: ActivityWithRating }> = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-5 rounded-[16px] shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[386/304]">
        <img 
          src={activity.main_image} 
          alt={`${activity.name} Team Building Activity`} 
          className="w-full h-full object-cover rounded-[16px]"
        />
        <div className="absolute top-3 left-3 bg-white rounded-full px-2 py-1 flex items-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF4C39" className="w-4 h-4 mr-1">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{activity.rating}</span>
        </div>
        {activity.activity_type && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1">
            <span className="text-sm font-medium text-[#636363]">{activity.activity_type}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-[#313131] mb-2">{activity.name}</h3>
        <p className="text-[#636363] mb-4 line-clamp-2">{activity.tagline}</p>
        <div className="flex items-center gap-4 text-sm text-[#636363] mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {activity.duration}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {activity.group_size}
          </div>
        </div>
        <Link 
          to={`/team-building-activity/${activity.slug}`}
          className="inline-block w-full text-center py-3 border border-[#b1b1b1] rounded-lg text-[#b1b1b1] font-semibold hover:bg-gradient-to-r hover:from-[#ff4c39] hover:to-[#ffb573] hover:text-white hover:border-transparent transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Fun & Engaging Team Building Activities | High Engagement Activities | Trebound</title>
        <meta 
          name="description" 
          content="Discover high-engagement team building activities designed to boost team morale, improve collaboration, and create lasting bonds. Perfect for corporate teams of all sizes." 
        />
        <meta 
          name="keywords" 
          content="team building activities, corporate team building, employee engagement, team bonding activities, fun team activities" 
        />
        <link rel="canonical" href="https://www.trebound.com/high-engagement-team-building-activities" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="w-full h-full object-cover"
            style={{
              backgroundImage: "url('/images/Fun activities.jpg')",
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-[64px] font-bold text-white mb-6 font-outfit leading-[74.6px] tracking-tight"
            >
              Fun & Engaging<br />Team Building Activities
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-white/90 mb-8"
            >
              Keep Your Employees Happy, Engaged and Energized
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link
                to="#cta-section"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-[#FF4C39] hover:bg-[#FF6B5C] transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Activity Portfolio
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-24 bg-gray-50" ref={activitiesRef}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-24">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-bold text-[#313131] mb-4">
              Explore Latest Games & Activities
            </h2>
            <p className="text-lg text-[#636363] max-w-3xl mx-auto">
              Improve Teamwork and Boost Team Morale With Engaging & Impactful Team Building Activities
            </p>
          </div>

          {activitiesLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4C39]"></div>
            </div>
          ) : activitiesError ? (
            <div className="text-center text-red-600 py-8">{activitiesError}</div>
          ) : relevantActivities.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              No relevant activities found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relevantActivities.slice(0, ITEMS_PER_PAGE).map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
              {relevantActivities.length > ITEMS_PER_PAGE && (
                <div className="text-center mt-12">
                  <Link
                    to="/team-building-activity"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FF4C39] hover:bg-[#FF6B5C] transition-colors duration-300"
                  >
                    View More Activities
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* --- NEW SECTION: All Available Activities --- */}
      <section className="py-24 bg-white"> {/* Changed background to white for contrast */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-24">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-bold text-[#313131] mb-4">
              All Available Activities
            </h2>
            <p className="text-lg text-[#636363] max-w-3xl mx-auto">
              Browse our complete collection of team building experiences.
            </p>
          </div>

          {/* Conditional Rendering Logic (Using allDisplayActivities) */}
          {activitiesLoading ? (
            // Loading Spinner
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4C39]"></div>
            </div>
          ) : activitiesError ? (
            // Error Message
            <div className="text-center text-red-600 py-8">{activitiesError}</div>
          ) : allDisplayActivities.length === 0 ? (
            // No Activities Found Message
            <div className="text-center text-gray-600 py-8">
              No activities found.
            </div>
          ) : (
            // Grid and Button (if activities exist)
            <>
              {/* Activity Grid (Using allDisplayActivities) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allDisplayActivities.slice(0, ITEMS_PER_PAGE).map((activity) => (
                  // Renders the local ActivityCard component
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
              {/* Conditional View More Button (Using allDisplayActivities) */}
              {allDisplayActivities.length > ITEMS_PER_PAGE && (
                <div className="text-center mt-12">
                  <Link
                    to="/team-building-activity"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FF4C39] hover:bg-[#FF6B5C] transition-colors duration-300"
                  >
                    View More Activities
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {/* --- END NEW SECTION --- */}

      {/* Why Us Section */}
      <WhyChooseTreboundSection />

      {/* How It Works Section */}
      <HowItWorksProcessSection />

      {/* Team Section */}
      <TeamSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Contact Section - assuming this is the CTA section */}
      <div id="cta-section">
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
};

export default HighEngagementTeamBuilding; 