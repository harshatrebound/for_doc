import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiClock, FiMapPin } from 'react-icons/fi';

interface ResortCardProps {
  image: string;
  title: string;
  description: string;
  rating?: string;
  slug: string;
  duration?: string;
  capacity?: string;
  location?: string;
}

// Gradient Icon component
const GradientIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[14px] h-[14px] relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full text-[#FF4C39]">
        {children}
      </div>
    </div>
  </div>
);

// Stat Icon component
const StatIcon = ({ type }: { type: 'guests' | 'location' | 'stay' }) => {
  const icons = {
    guests: <FiUsers size={12} strokeWidth={2} />,
    location: <FiMapPin size={12} strokeWidth={2} />,
    stay: <FiClock size={12} strokeWidth={2} />
  };

  return <GradientIcon>{icons[type]}</GradientIcon>;
};

// Rating Badge component
const RatingBadge = ({ rating }: { rating: string }) => (
  <div className="min-w-[60px] h-[24px] bg-white rounded-[16px] flex items-center justify-center shadow-sm px-3">
    <span className="text-[#313131] text-sm font-medium font-['Outfit']">{rating}</span>
  </div>
);

// Stat Badge component
const StatBadge = ({ type, children }: { type: 'guests' | 'location' | 'stay', children: React.ReactNode }) => (
  <div className="h-[24px] bg-white rounded-[16px] flex items-center justify-center px-3 gap-1.5 shadow-sm hover:shadow-md transition-shadow duration-300">
    <StatIcon type={type} />
    <span className="text-[#313131] text-sm font-medium font-['Outfit'] whitespace-nowrap">{children}</span>
  </div>
);

// View Details Button component
const ViewDetailsButton = ({ slug }: { slug: string }) => (
  <Link to={`/stays/${slug}`} className="block">
    <div className="relative w-full h-[45px] group">
      {/* Gradient background that shows on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ff4c39] to-[#ffb573] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[8px]" />
      
      {/* Button border and text */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center border border-[#b1b1b1] rounded-[8px] group-hover:border-transparent transition-colors duration-300">
        <span className="text-base font-bold font-['DM Sans'] text-[#b1b1b1] group-hover:text-white transition-colors duration-300">
          View Details
        </span>
      </div>
    </div>
  </Link>
);

const ResortCard = ({ 
  image, 
  title, 
  description, 
  rating = "4.6", 
  slug,
  duration = "3 hrs",
  capacity = "15-500",
  location = "Indoor/Outdoor"
}: ResortCardProps) => {
  return (
    <motion.div
      className="w-full bg-[#eeeeee] rounded-[16px] hover:shadow-md transition-all duration-300 group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="relative aspect-[386/304] rounded-[16px] overflow-hidden shadow-sm mb-4">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <RatingBadge rating={rating} />
          </div>
        </div>
        
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-semibold font-['DM Sans'] text-[#313131] line-clamp-1">
            {title}
          </h3>
          <p className="text-base font-normal font-['DM Sans'] text-[#636363] line-clamp-2">
            {description}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-between mt-4">
          <StatBadge type="guests">{capacity}</StatBadge>
          <StatBadge type="location">{location}</StatBadge>
          <StatBadge type="stay">{duration}</StatBadge>
        </div>

        <div className="mt-4">
          <ViewDetailsButton slug={slug} />
        </div>
      </div>
    </motion.div>
  );
};

export default ResortCard;
