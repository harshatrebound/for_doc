import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiUsers, FiTarget, FiBriefcase, FiArrowDown, FiAward, FiSmile, FiArrowRight } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import NewsletterSection from '../../components/NewsletterSection';
import ContactSection from '../../components/ContactSection';
import TeamSection from '../../components/TeamSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import PartnersSection from '../../components/PartnersSection';
import { supabase } from '../../lib/supabaseClient';

interface CorporateTeambuilding {
  id: number;
  name: string;
  slug: string;
  target_keyword?: string;
  main_heading?: string;
  meta_description?: string;
  tagline?: string;
  form_cta_heading?: string;
  form_cta_paragraph?: string;
  button_text?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

const CorporateTeamBuildingActivities: React.FC = () => {
  const [teambuildings, setTeambuildings] = useState<CorporateTeambuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeambuildings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('corporate_teambuildings')
          .select('id, name, slug, target_keyword, main_heading, meta_description, tagline, form_cta_heading, form_cta_paragraph, button_text, created_at, updated_at, published_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTeambuildings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTeambuildings();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Corporate Team Building Activities | Professional Team Building Solutions | Trebound</title>
        <meta 
          name="description" 
          content="Transform your team with engaging corporate team building activities. Keep your employees happy, engaged and energized with our diverse range of team building solutions." 
        />
        <meta
          name="keywords"
          content="corporate team building, team building activities, corporate training, team development, employee engagement, workplace collaboration"
        />
        <link rel="canonical" href="https://www.trebound.com/corporate-teambuilding" />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="w-full h-full object-cover"
            style={{
              backgroundImage: "url('/images/corporate-team.jpg')",
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Corporate Team Building Activities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-200 mb-8"
          >
            Strengthen team bonds and enhance workplace collaboration through engaging activities
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="#activities"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300"
            >
              Explore Activities
              <FiArrowDown className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#002B4F] mb-6">
              Why Choose Our Team Building Activities?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our corporate team building activities are designed to create lasting impact and meaningful connections within your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <FiUsers className="text-4xl text-[#FF4C39] mb-6" />
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Enhanced Team Bonding</h3>
              <p className="text-gray-600">
                Build stronger relationships and trust among team members through shared experiences and challenges.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <FiTarget className="text-4xl text-[#FF4C39] mb-6" />
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Improved Communication</h3>
              <p className="text-gray-600">
                Develop better communication skills and understanding between team members.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <FiBriefcase className="text-4xl text-[#FF4C39] mb-6" />
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Professional Growth</h3>
              <p className="text-gray-600">
                Foster leadership skills and professional development through engaging activities.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <FiAward className="text-4xl text-[#FF4C39] mb-6" />
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Increased Productivity</h3>
              <p className="text-gray-600">
                Boost team efficiency and productivity through improved collaboration.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <FiSmile className="text-4xl text-[#FF4C39] mb-6" />
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Employee Satisfaction</h3>
              <p className="text-gray-600">
                Create a positive work environment and boost employee morale.
              </p>
            </div>

            <div className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <FiTarget className="text-4xl text-[#FF4C39] mb-6" />
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Goal Achievement</h3>
              <p className="text-gray-600">
                Align team efforts towards common goals and objectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Team Building Activities Section */}
      <section id="activities" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#002B4F] mb-6">
              Our Corporate Team Building Programs
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive collection of corporate team building activities designed to transform your team dynamics and boost performance.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4C39]"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
            </div>
          )}

          {/* Team Building Activities Grid */}
          {!loading && !error && (
            <>
              {teambuildings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {teambuildings.map((teambuilding, index) => (
                    <motion.div
                      key={teambuilding.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-[#FF4C39] to-[#FFB573]">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {teambuilding.main_heading || teambuilding.name}
                          </h3>
                          {teambuilding.tagline && (
                            <p className="text-white/90 text-sm">
                              {teambuilding.tagline}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {teambuilding.meta_description || `Discover our ${teambuilding.name} program designed to enhance team collaboration and performance.`}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <Link
                            to={`/corporate-teambuilding/${teambuilding.slug}`}
                            className="inline-flex items-center text-[#FF4C39] hover:text-[#FFB573] font-medium transition-colors"
                          >
                            Learn More
                            <FiArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <FiUsers className="mr-1 w-4 h-4" />
                            <span>Team Activity</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiBriefcase className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Team Building Activities Yet
                  </h3>
                  <p className="text-gray-500">
                    Our corporate team building activities are being prepared. Check back soon!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Partners Section */}
      <PartnersSection />

      {/* Contact Section */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* Newsletter Section */}
      <NewsletterSection />

      <Footer />
    </div>
  );
};

export default CorporateTeamBuildingActivities; 