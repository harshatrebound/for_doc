import { useInView } from 'react-intersection-observer';
import { memo } from 'react';
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
  const [ref, inView] = useInView({
    threshold: 0.15,
    triggerOnce: true
  });

  // Use the custom hero image
  const heroImage = heroImageUrl;

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
