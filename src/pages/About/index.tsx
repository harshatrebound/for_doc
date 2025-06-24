import { motion, useScroll, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Helmet } from 'react-helmet-async';

// Add custom styles
const styles = {
  textShadow: {
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)'
  }
};

const AboutPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const journeySectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: journeySectionRef,
    offset: ["start start", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    return scrollYProgress.onChange(v => {
      setScrollProgress(v);
    });
  }, [scrollYProgress]);

  const [ref] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <>
      <Helmet>
        <title>About Us | Trebound - Team Building & Corporate Events</title>
        <meta 
          name="description" 
          content="Learn about Trebound's mission to transform teams through exceptional team building experiences and corporate events. Discover our story, values, and commitment to excellence."
        />
      </Helmet>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full object-cover"
            style={{
              backgroundImage: "url('/images/Mask group.png')",
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
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-lg font-bold mb-4 px-3 py-1 inline-block rounded bg-black/30 tracking-wider shadow-lg text-white"
              style={{
                ...styles.textShadow,
                borderLeft: '3px solid #FF5A3C'
              }}
            >
              Transforming Collaboration into Unforgettable Experiences
            </motion.h2>
            <motion.h1
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-[64px] font-bold text-white mb-6 font-outfit leading-[74.6px] tracking-tight"
            >
              Architects of Unforgettable<br />
              Team Experiences
            </motion.h1>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Welcome Section */}
      <section className="relative py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-12">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-[40px] font-bold mb-6 lg:mb-0 font-inter"
                style={{
                  background: 'linear-gradient(135deg, #ff4c39 0%, #ffb573 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Welcome to Trebound
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl md:text-2xl text-gray-600 lg:text-right font-outfit"
              >
                Where team building transforms<br />into triumphs.
              </motion.p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg md:text-xl text-gray-700 leading-relaxed text-left"
              >
                Our mission is to create unparalleled team-building experiences that foster unity and ignite success. 
                From our humble beginnings, we have grown into a leading provider, renowned for our creativity, 
                passion, and commitment to excellence. Whether you're looking to strengthen bonds, boost morale, or 
                celebrate achievements, Trebound offers a wide array of tailored experiences. Join us on a journey of 
                growth, collaboration, and unforgettable memories.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section ref={journeySectionRef} className="bg-white py-20 relative">
        {/* Fixed Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="fixed right-8 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col items-center"
          style={{
            opacity: scrollProgress > 0 && scrollProgress < 1 ? 1 : 0
          }}
        >
          <div className="h-[300px] w-[2px] bg-gray-200 rounded relative">
            <motion.div
              className="absolute top-0 left-0 w-full bg-[#FF7B5F] rounded origin-top"
              style={{ scaleY }}
            />
          </div>
        </motion.div>

        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex justify-between items-start mb-24">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-[40px] font-bold text-[#FF7B5F]"
              >
                Our Journey
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl text-[#636363]"
              >
                From Humble Beginnings to<br />Industry Leaders
              </motion.p>
            </div>

            {/* Journey Cards */}
            <div className="space-y-24">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative bg-[#efefef] rounded-2xl overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-12">
                    <h3 className="text-[40px] font-bold text-[#FF7B5F] mb-6"
                      style={{
                        background: 'linear-gradient(135deg, #ff4c39 0%, #ffb573 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Early Days
                    </h3>
                    <p className="text-2xl text-[#636363] mb-6">
                      Our journey started in a small office with a big dream.
                    </p>
                    <p className="text-lg text-[#636363] leading-relaxed">
                      We hosted our first team-building event with just a handful of participants, focusing on creative problem-solving and collaboration. The positive feedback and enthusiasm we received fueled our passion and determination to grow.
                    </p>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="h-full w-full p-10">
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                        className="h-full w-full overflow-hidden rounded-lg"
                      >
                        <img
                          src="/images/Rectangle 993.png"
                          alt="Early Days"
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Growth and Expansion Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative bg-[#efefef] rounded-2xl overflow-hidden"
              >
                {/* Content and Main Image Block */}
                <div className="flex flex-col lg:flex-row mb-8">
                  <div className="lg:w-1/2 p-12">
                    <h3 className="text-[40px] font-bold text-[#FF7B5F] mb-6"
                      style={{
                        background: 'linear-gradient(135deg, #ff4c39 0%, #ffb573 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Growth and Expansion
                    </h3>
                    <p className="text-2xl text-[#636363] mb-6">
                      As word spread about our unique approach to team building.
                    </p>
                    <p className="text-lg text-[#636363] leading-relaxed">
                      Trebound quickly gained traction, expanding our offerings to include outdoor adventures, indoor challenges, and experiential learning workshops. Our quality and innovation attracted clients from various industries, and our team grew to include experts in event planning, psychology, and experiential learning.
                    </p>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="h-full w-full p-10">
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                        className="h-full w-full overflow-hidden rounded-lg"
                      >
                        <img
                          src="/images/Rectangle 993 (1).png"
                          alt="Team working together"
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Image Grid Block */}
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative h-[390px]">
                      <img
                        src="/images/Rectangle 997.png"
                        alt="First Outdoor Adventure Event"
                        className="w-full h-full object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white text-sm font-medium text-center rounded-b-lg">
                        First Outdoor Adventure Event
                      </div>
                    </div>
                    <div className="relative h-[390px]">
                      <img
                        src="/images/Rectangle 997 (1).png"
                        alt="Introduced Indoor Challenges"
                        className="w-full h-full object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white text-sm font-medium text-center rounded-b-lg">
                        Introduced Indoor Challenges
                      </div>
                    </div>
                    <div className="relative h-[390px]">
                      <img
                        src="/images/Rectangle 997 (2).png"
                        alt="Launched Experiential Learning Workshops"
                        className="w-full h-full object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white text-sm font-medium text-center rounded-b-lg">
                        Launched Experiential Learning Workshops
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Milestones and Achievements Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative bg-[#efefef] rounded-2xl overflow-hidden"
              >
                {/* Content and Main Image Block */}
                <div className="flex flex-col lg:flex-row mb-8">
                  <div className="lg:w-1/2 p-12">
                    <h3 className="text-[40px] font-bold text-[#FF7B5F] mb-6"
                      style={{
                        background: 'linear-gradient(135deg, #ff4c39 0%, #ffb573 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Milestones and Achievements
                    </h3>
                    <p className="text-2xl text-[#636363] mb-6">
                      Our journey started in a small office with a big dream.
                    </p>
                    <p className="text-lg text-[#636363] leading-relaxed">
                      We hosted our first team-building event with just a handful of participants, focusing on creative problem-solving and collaboration. The positive feedback and enthusiasm we received fueled our passion and determination to grow.
                    </p>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="h-full w-full p-10">
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                        className="h-full w-full overflow-hidden rounded-lg"
                      >
                        <img
                          src="/images/Rectangle 993 (2).png"
                          alt="Achievement Milestone"
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Achievement Cards Block */}
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="w-20 h-20 mx-auto mb-4">
                        <img
                          src="/images/Vector (2).png"
                          alt="Events Icon"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="text-xl font-bold text-[#FF5A3C] mb-2">100+ Events Organized</h4>
                      <p className="text-[#636363]">Successfully delivered memorable experiences across diverse industries</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="w-20 h-20 mx-auto mb-4">
                        <img
                          src="/images/engaged.png"
                          alt="Collaboration Icon"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="text-xl font-bold text-[#FF5A3C] mb-2">Collaborations with Leading Corporation</h4>
                      <p className="text-[#636363]">Trusted by top companies for their team building needs</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="w-20 h-20 mx-auto mb-4">
                        <img
                          src="/images/Vector (3).png"
                          alt="Awards Icon"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="text-xl font-bold text-[#FF5A3C] mb-2">Industry Awards</h4>
                      <p className="text-[#636363]">Recognized for excellence in team building and corporate events</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative bg-[#002B4E] py-24 overflow-hidden">
        {/* Decorative Wave Pattern */}
        <div className="absolute inset-0">
          <svg 
            className="absolute w-full h-full"
            viewBox="0 0 1440 400"
            preserveAspectRatio="none"
          >
            <path
              d="M0,150 Q360,300 720,150 T1440,150"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
              className="transition-all duration-300"
            />
            <path
              d="M0,150 Q360,250 720,150 T1440,150"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
              className="transition-all duration-300"
              style={{ transform: 'translateY(20px)' }}
            />
            <path
              d="M0,150 Q360,200 720,150 T1440,150"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
              className="transition-all duration-300"
              style={{ transform: 'translateY(40px)' }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-white text-2xl mb-4"
            >
              Mission
            </motion.h2>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold font-['Inter'] leading-tight bg-gradient-to-b from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent mb-12"
            >
              Uniting Teams, Igniting Success
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-white text-2xl md:text-3xl leading-relaxed mb-8 font-light"
            >
              "Our mission is to unite teams and spark success through innovative experiences. We foster teamwork and deliver tangible results for our clients."
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-white text-2xl italic"
            >
              Time Together!
            </motion.p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-gray-800 text-2xl mb-4"
            >
              Team
            </motion.h2>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold font-['Inter'] leading-tight bg-gradient-to-b from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent"
            >
              Meet Our Trailblazers
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Team Member 1 - Jemcy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {/* Original Image */}
                <img
                  src="/images/Team hover 1.png"
                  alt="Jemcy - Innovator at Heart"
                  className="w-full h-full object-cover object-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  {/* Name with Decorative Line */}
                  <div className="relative mb-4">
                    <h4 className="text-3xl font-bold text-white mb-3">Jemcy</h4>
                  </div>
                  
                  {/* Role with Gradient Text */}
                  <p className="text-lg font-medium text-white/90 transform -translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                    Innovator at Heart
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Team Member 2 - Vaishnavi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {/* Original Image */}
                <img
                  src="/images/team hover 2.png"
                  alt="Vaishnavi - Nature Enthusiast"
                  className="w-full h-full object-cover object-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  {/* Name with Decorative Line */}
                  <div className="relative mb-4">
                    <h4 className="text-3xl font-bold text-white mb-3">Vaishnavi</h4>
                  </div>
                  
                  {/* Role with Gradient Text */}
                  <p className="text-lg font-medium text-white/90 transform -translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                    Nature Enthusiast
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Team Member 3 - Raj Lakshmi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                {/* Original Image */}
                <img
                  src="/images/team hover 3.png"
                  alt="Raj Lakshmi - Cultural Explorer"
                  className="w-full h-full object-cover object-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  {/* Name with Decorative Line */}
                  <div className="relative mb-4">
                    <h4 className="text-3xl font-bold text-white mb-3">Raj Lakshmi</h4>
                  </div>
                  
                  {/* Role with Gradient Text */}
                  <p className="text-lg font-medium text-white/90 transform -translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                    Cultural Explorer
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Culture Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-gray-800 text-2xl mb-4"
            >
              Company Culture
            </motion.h2>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold font-['Inter'] leading-tight bg-gradient-to-b from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent mb-[5px]"
            >
              Fueling Fun and Growth
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
            {/* Office Space Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c"
                alt="Modern office workspace"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            {/* Game Room Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f"
                alt="Team playing games"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            {/* Office Design Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2"
                alt="Modern office corridor"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>

            {/* Team Collaboration Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1558403194-611308249627"
                alt="Team brainstorming session"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </motion.div>
          </div>

          {/* Join Us Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <a 
              href="/jobs" 
              className="inline-block px-8 py-3 text-lg font-medium border-2 border-[#FF5A3C] text-[#FF5A3C] rounded-full hover:bg-[#FF5A3C] hover:text-white transition-all duration-300"
            >
              Join Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Awards and Recognitions Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-gray-800 text-2xl mb-4"
            >
              Awards and Recognitions
            </motion.h2>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold font-['Inter'] leading-tight bg-gradient-to-b from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent"
            >
              Our Achievements
            </motion.h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 2024 Achievement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative overflow-hidden rounded-3xl bg-[#F8FBFF] shadow-lg group"
            >
              <div className="relative aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
                  alt="2024 Achievement"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-[64px] font-bold text-white drop-shadow-lg">
                    2024
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2021 Achievement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative overflow-hidden rounded-3xl bg-[#F8FBFF] shadow-lg group"
            >
              <div className="relative aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                  alt="2021 Achievement"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-[64px] font-bold text-white drop-shadow-lg">
                    2021
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2020 Achievement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative overflow-hidden rounded-3xl bg-[#F8FBFF] shadow-lg group"
            >
              <div className="relative aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
                  alt="2020 Achievement"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-[64px] font-bold text-white drop-shadow-lg">
                    2020
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-24 bg-[#002B4E]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-white text-5xl md:text-6xl font-bold mb-8"
            >
              Join Us on Our Journey
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/90 text-xl md:text-2xl mb-12 space-y-2"
            >
              <p>Be part of our journey as we continue to innovate and inspire.</p>
              <p>Join us in creating unforgettable team-building experiences.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a 
                href="/contact" 
                className="inline-block px-8 py-3 text-lg font-medium border-2 border-[#FF5A3C] text-[#FF5A3C] rounded-full relative overflow-hidden group hover:text-white transition-all duration-300"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#ff4c39] to-[#ffb573] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">Contact</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="w-full bg-[#eeeeee] py-12">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="block text-sm md:text-base font-medium font-['DM Sans'] text-[#636363] mb-2"
            >
              Our Partners
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl md:text-[40px] font-semibold font-['Inter'] leading-tight bg-gradient-to-b from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent"
            >
              Trusted by Industry Leaders
            </motion.h2>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
            {[
              {
                name: 'Partner Company 1',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c5f_6.webp',
              },
              {
                name: 'Partner Company 2',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c5d_32.webp',
              },
              {
                name: 'Partner Company 3',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c5b_5.webp',
              },
              {
                name: 'Partner Company 4',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c59_2.webp',
              },
              {
                name: 'Partner Company 5',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e2ec85b68d550746b8d92e_1.webp',
              },
              {
                name: 'Partner Company 6',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c51_18.webp',
              },
              {
                name: 'Partner Company 7',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e2ec85b68d550746b8d92a_27.webp',
              },
              {
                name: 'Partner Company 8',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c57_21.webp',
              },
              {
                name: 'Partner Company 9',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c55_22.webp',
              },
              {
                name: 'Partner Company 10',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c53_20.webp',
              },
              {
                name: 'Partner Company 11',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c4f_23.webp',
              },
              {
                name: 'Partner Company 12',
                logo: 'https://cdn.prod.website-files.com/655e49f111202615f47a3d82/65e5c92892bf62b79a899c4d_17.webp',
              },
            ].slice(0, 6).map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group flex justify-center"
              >
                <motion.img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-16 max-w-full opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 object-contain"
                  whileHover={{ scale: 1.05 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default AboutPage; 