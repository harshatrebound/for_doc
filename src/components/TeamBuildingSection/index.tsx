import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useActivities } from '../../lib/hooks/useSupabaseData';

// Reusable button component
const ViewDetailsButton = () => (
  <div className="relative h-[45px] group cursor-pointer">
    <div className="absolute inset-0 bg-gradient-to-b from-[#ff4c39] to-[#ffb573] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[8px]" />
    <div className="absolute inset-0 w-full h-full flex items-center justify-center border border-[#979797] rounded-[8px] group-hover:border-transparent transition-colors duration-300">
      <span className="text-base font-medium font-['DM Sans'] text-[#979797] group-hover:text-white transition-colors duration-300">
        View Activity
      </span>
    </div>
  </div>
);

// Reusable badge components
const StatBadge = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full">
    {icon}
    <span className="text-sm font-medium text-[#636363]">{label}</span>
  </div>
);

const RatingBadge = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7.24167 10.535L10.2783 12.4467C10.7267 12.7217 11.27 12.32 11.165 11.8133L10.3233 8.39833L13.0433 6.02167C13.44 5.67833 13.2333 5.03333 12.7167 4.99833L9.21667 4.71667L7.845 1.47667C7.63167 0.991667 6.85167 0.991667 6.63833 1.47667L5.26667 4.71667L1.76667 4.99833C1.25 5.03333 1.04333 5.67833 1.44 6.02167L4.16 8.39833L3.31833 11.8133C3.21333 12.32 3.75667 12.7217 4.205 12.4467L7.24167 10.535Z" fill="url(#rating-gradient)"/>
    </svg>
    <span className="text-sm font-medium text-[#636363]">{rating}</span>
  </div>
);

export const TeamBuildingActivitiesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { activities, loading: activitiesLoading, error: activitiesError } = useActivities();

  // Filter virtual team building activities
  const teamBuildingActivities = activities
    ?.filter(activity => 
      activity.activity_type === 'Virtual Team Building' || 
      activity.name?.toLowerCase().includes('virtual')
    )
    ?.map(activity => ({
      id: activity.id,
      image: activity.main_image || '/images/activity-placeholder.jpg',
      title: activity.name,
      description: activity.tagline || (activity as any).short_description || (activity.description ? `${activity.description.slice(0, 100)}...` : ''),
      slug: activity.slug,
      rating: (activity as any).rating || 4.8,
      participants: activity.group_size || '15-100',
      duration: activity.duration || '2-3 Hours',
      type: 'Virtual Team Building'
    })) || [];

  if (activitiesError) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading activities: {activitiesError}</p>
      </div>
    );
  }

  return (
    <section className="w-full bg-white py-12" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-6 max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-12 mb-12">
          <div className="flex-1 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-lg font-medium font-['DM Sans'] text-[#636363] mb-2"
            >
              Virtual Team Building Activities
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[40px] font-semibold font-['Inter'] leading-tight bg-gradient-to-b from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent"
            >
              Connect Teams Virtually
            </motion.h2>
          </div>
        </div>

        {/* Activity Cards */}
        {activitiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
              <div key={index} className="bg-[#eeeeee] rounded-[20px] overflow-hidden animate-pulse">
                <div className="p-7">
                  <div className="aspect-[386/304] rounded-[20px] bg-gray-300 mb-6" />
                  <div className="h-8 bg-gray-300 rounded mb-4" />
                  <div className="h-6 bg-gray-300 rounded mb-6" />
                </div>
              </div>
            ))}
          </div>
        ) : teamBuildingActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No team building activities found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {teamBuildingActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="w-full bg-[#eeeeee] rounded-[16px] hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="relative aspect-[386/304] rounded-[16px] overflow-hidden shadow-sm mb-4">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/activity-placeholder.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <RatingBadge rating={activity.rating} />
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-semibold font-['DM Sans'] text-[#313131] line-clamp-1">
                      {activity.title}
                    </h3>
                    <p className="text-base font-normal font-['DM Sans'] text-[#636363] line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-between mt-4">
                    <StatBadge
                      icon={
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                          <path d="M5 6.66667C6.61083 6.66667 7.91667 5.36083 7.91667 3.75C7.91667 2.13917 6.61083 0.833333 5 0.833333C3.38917 0.833333 2.08333 2.13917 2.08333 3.75C2.08333 5.36083 3.38917 6.66667 5 6.66667Z" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
                          <path d="M9.16667 12.5C9.16667 9.27833 7.32167 6.66667 5 6.66667C2.67833 6.66667 0.833333 9.27833 0.833333 12.5" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
                        </svg>
                      }
                      label={activity.participants}
                    />
                    <StatBadge
                      icon={
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 13.1667C10.4058 13.1667 13.1667 10.4058 13.1667 7C13.1667 3.59421 10.4058 0.833333 7 0.833333C3.59421 0.833333 0.833333 3.59421 0.833333 7C0.833333 10.4058 3.59421 13.1667 7 13.1667Z" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
                          <path d="M7 3.33333V7L9.16667 9.16667" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
                        </svg>
                      }
                      label={activity.duration}
                    />
                    <StatBadge
                      icon={
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M6.25 12.75H2.5C1.53333 12.75 0.75 11.9667 0.75 11V2.5C0.75 1.53333 1.53333 0.75 2.5 0.75H11C11.9667 0.75 12.75 1.53333 12.75 2.5V6.25" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
                          <path d="M4.16667 5.41667H8.75" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
                          <path d="M4.16667 8.33333H6.25" stroke="url(#icon-gradient)" strokeWidth="1.5"/>
                        </svg>
                      }
                      label={activity.type}
                    />
                  </div>

                  <div className="mt-4">
                    <Link to={`/team-building-activity/${activity.slug}`}>
                      <ViewDetailsButton />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View More Button */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-[200px]"
          >
            <Link to="/team-building-activity">
              <div className="relative h-[45px] group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-b from-[#ff4c39] to-[#ffb573] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[8px]" />
                <div className="absolute inset-0 w-full h-full flex items-center justify-center border border-[#979797] rounded-[8px] group-hover:border-transparent transition-colors duration-300">
                  <span className="text-base font-medium font-['DM Sans'] text-[#979797] group-hover:text-white transition-colors duration-300">
                    View More Activities
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF4C39" />
            <stop offset="100%" stopColor="#FFB573" />
          </linearGradient>
          <linearGradient id="rating-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF4C39" />
            <stop offset="100%" stopColor="#FFB573" />
          </linearGradient>
        </defs>
      </svg>
    </section>
  );
};

export default TeamBuildingActivitiesSection; 