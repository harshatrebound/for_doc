import { useInView } from 'react-intersection-observer';
import { memo, useEffect, useState } from 'react';
import {
  HeroContainer,
  ContentContainer,
  Title,
  Subtitle,
  StatsContainer,
  StatCard,
  StatNumber,
  StatLabel,
} from './styles';
import { fadeInUp, fadeInScale, staggerChildren } from './animations';

interface GradientHeroProps {
  className?: string;
}

// Hero image - custom image from public folder
const heroImageUrl = "/hero.webp";

const GradientHero: React.FC<GradientHeroProps> = ({ className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.15,
    triggerOnce: true,
    rootMargin: '50px' // Start loading earlier
  });

  // Preload hero image for better LCP
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = heroImageUrl;
  }, []);

  // Stats with hardcoded values
  const stats = [
    {
      number: '96,753+',
      label: 'Employees\nengaged'
    },
    {
      number: '4.9/5',
      label: 'Stellar Feedback\non Google'
    },
    {
      number: '550+',
      label: 'Global organizations\ntrust us'
    }
  ];

  return (
    <div className="relative">
      <HeroContainer ref={ref} className={className}>
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: imageLoaded ? `url('${heroImageUrl}')` : 'none',
            backgroundColor: imageLoaded ? 'transparent' : '#1a1a1a', // Fallback color
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: imageLoaded ? 1 : 0.8,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.5)]" />
        </div>
        
        {/* Optimize LCP element - reduce animation complexity */}
        <ContentContainer 
          variants={staggerChildren} 
          initial="hidden" 
          animate="visible" // Always visible to improve LCP
        >
          <Title
            className="hero-title" // Use CSS class for faster rendering
            initial="hidden"
            animate="visible" // Always visible for LCP
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.3 } } // Faster animation
            }}
          >
            Transform Your Team<br />Into Champions
          </Title>
          <Subtitle
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ delay: 0.1 }} // Reduced delay
          >
            Your Ultimate Team Building and Experience Hub
          </Subtitle>
        </ContentContainer>

        {/* Lazy load stats - not critical for LCP */}
        <StatsContainer 
          variants={staggerChildren} 
          initial="hidden" 
          animate={inView ? "visible" : "hidden"}
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeInScale}
              className="sm:w-full"
            >
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsContainer>
      </HeroContainer>
      <div className="h-[100px] md:h-[100px] sm:h-[200px] bg-white" />
    </div>
  );
};

export default memo(GradientHero);
