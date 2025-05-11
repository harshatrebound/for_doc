import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiShare2 } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactSection from '../../components/ContactSection';
import NewsletterSection from '../../components/NewsletterSection';
import SkipSearchPopup from '../../components/SkipSearchPopup';
import DOMPurify from 'dompurify';
import TestimonialsSection from '../../components/TestimonialsSection';
import PartnersSection from '../../components/PartnersSection';
import { supabase } from '../../lib/supabaseClient';

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
  reason_4_heading: string;
  reason_4_paragraph: string;
  reason_5_heading: string;
  reason_5_paragraph: string;
  form_cta_heading: string;
  form_cta_paragraph: string;
  button_text: string;
  special_section_heading: string;
  card_1_heading: string;
  card_1_image: string;
  card_2_heading: string;
  card_2_image: string;
  card_3_heading: string;
  card_3_image: string;
  card_4_heading: string;
  card_4_image: string;
  hero_image?: string;
  post_body?: string;
  target_keyword: string;
}

const CorporateTeambuildingDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [teambuilding, setTeambuilding] = useState<CorporateTeambuilding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkipSearchPopup, setShowSkipSearchPopup] = useState(false);

  useEffect(() => {
    const fetchTeambuilding = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('corporate_teambuilding')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Corporate teambuilding not found');

        setTeambuilding(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTeambuilding();
    }
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: teambuilding?.name || 'Corporate Teambuilding',
        text: teambuilding?.tagline || 'Check out this corporate teambuilding activity',
        url: window.location.href
      }).catch(console.error);
    }
  };

  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html || '', {
      ADD_ATTR: ['target', 'class', 'style', 'id', 'data-*'],
      ADD_TAGS: ['iframe'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'class', 'style', 'width', 'height', 'frameborder', 'allowfullscreen', 'id', 'data-*']
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF4C39]"></div>
        </div>
      </div>
    );
  }

  if (error || !teambuilding) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col justify-center items-center py-40 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {error || 'Corporate teambuilding not found'}
          </h1>
          <p className="text-gray-600 mb-8">
            The corporate teambuilding you're looking for may have been removed or doesn't exist.
          </p>
          <Link 
            to="/corporate-teambuilding" 
            className="px-6 py-3 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Browse All Corporate Teambuildings
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{teambuilding.name} | Trebound</title>
        <meta name="description" content={teambuilding.meta_description} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />
        
        <SkipSearchPopup 
          isVisible={showSkipSearchPopup} 
          onClose={() => setShowSkipSearchPopup(false)} 
        />

        <section className="relative pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-outfit leading-tight">
                  {teambuilding.main_heading || teambuilding.name}
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 font-dm-sans">
                  {teambuilding.tagline}
                </p>
                
                <div className="flex flex-wrap gap-6 text-gray-600 text-lg mb-8">
                  <div className="flex items-center">
                    <FiUsers className="mr-2 text-[#FF4C39]" />
                    <span>Team Activity</span>
                  </div>
                  <div className="flex items-center">
                    <FiBriefcase className="mr-2 text-[#FF4C39]" />
                    <span>Corporate</span>
                  </div>
                  <button 
                    onClick={handleShare}
                    className="flex items-center text-[#FF4C39] hover:text-[#FFB573] transition-colors"
                  >
                    <FiShare2 className="mr-2" />
                    <span>Share</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowSkipSearchPopup(true)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300"
                >
                  {teambuilding.button_text || "Get Started"}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-1 lg:order-2"
              >
                <img
                  src={teambuilding.hero_image || '/images/default-hero.jpg'}
                  alt={teambuilding.name}
                  className="w-full h-[500px] object-cover rounded-2xl shadow-lg"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(teambuilding.post_body || '') }} />
            </div>
          </div>
        </section>

        {/* Special Section */}
        {teambuilding.special_section_heading && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-[#002B4F] mb-12">
                {teambuilding.special_section_heading}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { heading: teambuilding.card_1_heading, image: teambuilding.card_1_image },
                  { heading: teambuilding.card_2_heading, image: teambuilding.card_2_image },
                  { heading: teambuilding.card_3_heading, image: teambuilding.card_3_image },
                  { heading: teambuilding.card_4_heading, image: teambuilding.card_4_image }
                ].map((card, index) => (
                  card.heading && card.image && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl overflow-hidden"
                    >
                      <div className="relative pt-[75%]">
                        <img
                          src={card.image}
                          alt={card.heading}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-[#002B4F]">{card.heading}</h3>
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">
                {teambuilding.form_cta_heading || `Ready to ${teambuilding.name.split(' ')[0]} Your Team with ${teambuilding.name.split(' ').slice(1).join(' ')}?`}
              </h2>
              <div 
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto prose prose-lg"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeHtml(teambuilding.form_cta_paragraph) || `Take the first step toward transforming your team with our ${teambuilding.name} program. Contact us today to discuss your specific needs.`
                }}
              />
              <button
                onClick={() => setShowSkipSearchPopup(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {teambuilding.button_text || "Get Started"}
              </button>
            </motion.div>
          </div>
        </section>

        <TestimonialsSection />
        <PartnersSection />

        <div id="contact">
          <ContactSection />
        </div>

        <NewsletterSection />
        <Footer />
      </div>
    </>
  );
};

export default CorporateTeambuildingDetail; 