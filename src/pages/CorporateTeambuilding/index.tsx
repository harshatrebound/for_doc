import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUsers, FiTarget, FiBriefcase, FiArrowDown, FiArrowRight, FiAward, FiSmile } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import NewsletterSection from '../../components/NewsletterSection';
import ContactSection from '../../components/ContactSection';

// Define interfaces for the data structure
interface CorporateTeambuilding {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  main_heading: string;
  meta_description: string;
  heading_2: string;
  heading_2_argument: string;
  heading_3: string;
  heading_3_argument_1: string;
  heading_3_argument_2: string;
  reason_1_heading: string;
  reason_1_paragraph: string;
  reason_2_heading: string;
  reason_2_paragraph: string;
  reason_3_heading: string;
  reason_3_paragraph: string;
  card_1_heading: string;
  card_1_image: string;
  card_2_heading: string;
  card_2_image: string;
  card_3_heading: string;
  card_3_image: string;
  card_4_heading: string;
  card_4_image: string;
  hero_image?: string;
}

const CorporateTeambuilding = () => {
  const [teambuildings, setTeambuildings] = useState<CorporateTeambuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80");

  useEffect(() => {
    const fetchTeambuildings = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/corporate_teambuildings?select=*`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched corporate teambuildings:', data);
          setTeambuildings(data);
          
          // Optionally set a hero image from a featured teambuilding
          if (data.length > 0 && data[0].hero_image) {
            setHeroImage(data[0].hero_image);
          }
        } else {
          console.error('Error response:', await response.text());
          setError('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching corporate teambuildings:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTeambuildings();
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Corporate Team Building Solutions | Trebound</title>
        <meta name="description" content="Elevate your corporate culture with specialized team building programs designed to enhance collaboration, boost morale, and increase productivity in your organization." />
        <meta property="og:title" content="Corporate Team Building Solutions | Trebound" />
        <meta property="og:description" content="Elevate your corporate culture with specialized team building programs designed to enhance collaboration, boost morale, and increase productivity in your organization." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Corporate Team Building"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative text-center px-4 max-w-5xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-outfit leading-tight">
              Elevate Your Corporate Culture with
              <span className="block bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                Transformative Experiences
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-dm-sans">
              Specialized team building programs designed to enhance collaboration, boost morale, and drive productivity in your organization.
            </p>
            <a
              href="#featured"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300 group"
            >
              Discover Solutions
              <FiArrowDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
            </a>
          </motion.div>
        </section>

        {/* Introduction Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">
                <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                  Why Corporate Team Building Matters
                </span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                In today's competitive business environment, fostering a collaborative and engaged workforce isn't just beneficial—it's essential for sustainable success.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <FiUsers className="w-12 h-12" />,
                  title: "Enhanced Collaboration",
                  description: "Break down silos and foster cross-departmental communication through shared experiences and challenges."
                },
                {
                  icon: <FiAward className="w-12 h-12" />,
                  title: "Boosted Employee Morale",
                  description: "Create meaningful connections that increase job satisfaction and reduce turnover in your organization."
                },
                {
                  icon: <FiSmile className="w-12 h-12" />,
                  title: "Improved Workplace Culture",
                  description: "Develop a positive work environment that attracts top talent and promotes long-term engagement."
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="mb-6 text-gray-400 group-hover:text-[#FF4C39] transition-colors duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-outfit group-hover:text-[#FF4C39] transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Teambuildings Grid */}
        <section id="featured" className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-12 text-center font-outfit"
            >
              <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                Tailored Corporate Solutions
              </span>
              <span className="block text-3xl md:text-4xl mt-2 text-gray-800">
                For Your Organization
              </span>
            </motion.h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <p className="text-gray-600">Please try again later or contact support.</p>
              </div>
            ) : teambuildings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No corporate teambuilding solutions found.</p>
                <p className="text-gray-500 mt-2">Please check back later for updates.</p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {teambuildings.map((teambuilding) => (
                  <motion.div
                    key={teambuilding.id}
                    variants={fadeInUp}
                    className="rounded-xl overflow-hidden bg-white shadow-xl transition-all duration-300 hover:shadow-2xl h-full flex flex-col"
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Link to={`/corporate-teambuilding/[landing-page]`.replace('[landing-page]', teambuilding.slug)} className="block h-full flex flex-col">
                      <div className="relative h-48 md:h-60 overflow-hidden">
                        <img
                          src={teambuilding.card_1_image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"}
                          alt={teambuilding.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-gray-900/70 to-transparent w-full h-1/3"></div>
                        
                        {/* Trebound favicon with date */}
                        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-white shadow-md overflow-hidden p-0">
                            <img 
                              src="/images/trebound-favicon-32px.jpg" 
                              alt="Trebound" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-grow flex flex-col">          
                        <h3 className="text-xl font-medium text-primary mb-3 line-clamp-2 font-outfit">
                          {teambuilding.name}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                          {teambuilding.tagline || "Specialized corporate teambuilding program designed to enhance collaboration and productivity in your organization."}
                        </p>
                        
                        <div className="mt-auto pt-4">
                          <span className="inline-flex items-center text-[rgb(26,54,93)] font-medium group no-underline">
                            Learn More
                            <FiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-16 text-center font-outfit"
            >
              <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                Why Choose Trebound
              </span>
              <span className="block text-3xl md:text-4xl mt-2 text-gray-800">
                For Your Corporate Team Building
              </span>
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
              {[
                {
                  icon: <FiTarget className="w-10 h-10" />,
                  title: "Customized to Your Needs",
                  description: "We craft bespoke experiences aligned with your company's values, goals, and team dynamics."
                },
                {
                  icon: <FiBriefcase className="w-10 h-10" />,
                  title: "Expert Facilitation",
                  description: "Our skilled facilitators ensure every activity maximizes engagement and meaningful outcomes."
                },
                {
                  icon: <FiAward className="w-10 h-10" />,
                  title: "Measurable Results",
                  description: "Track improvements in team performance with our comprehensive post-program assessments."
                },
                {
                  icon: <FiUsers className="w-10 h-10" />,
                  title: "Global Experience",
                  description: "Trusted by leading organizations worldwide to deliver impactful team building solutions."
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-[#FF4C39]">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 font-outfit">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />

        {/* Newsletter Section */}
        <NewsletterSection />
        
        <Footer />
      </div>
    </>
  );
};

export default CorporateTeambuilding; 