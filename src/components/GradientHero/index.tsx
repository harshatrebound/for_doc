import { useInView } from 'react-intersection-observer';
import { memo, useMemo } from 'react';
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

// Team building related hero images
const teamBuildingImages = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop", // Team with hands together
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop", // Team meeting
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Team collaboration
  "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?q=80&w=2070&auto=format&fit=crop", // Team success
  "https://images.unsplash.com/photo-1603201667141-5a2d4c673378?q=80&w=2069&auto=format&fit=crop"  // Team outdoor activity
];

const GradientHero: React.FC<GradientHeroProps> = ({ className }) => {
  const [ref, inView] = useInView({
    threshold: 0.15,
    triggerOnce: true
  });

  // Select a random team building image
  const heroImage = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * teamBuildingImages.length);
    return teamBuildingImages[randomIndex];
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
            backgroundImage: `url('${heroImage}')`, 
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.5)]" />
        </div>
        <ContentContainer variants={staggerChildren} initial="hidden" animate={inView ? "visible" : "hidden"}>
          <Title
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Transform Your Team<br />Into Champions
          </Title>
          <Subtitle
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
          >
            Your Ultimate Team Building and Experience Hub
          </Subtitle>
        </ContentContainer>

        <StatsContainer variants={staggerChildren} initial="hidden" animate={inView ? "visible" : "hidden"}>
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
      <div className="h-[100px] md:h-[100px] sm:h-[200px] bg-white" /> {/* Adjusted spacer for mobile */}
    </div>
  );
};

export default memo(GradientHero);
