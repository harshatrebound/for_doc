import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiUsers, FiTarget, FiBriefcase, FiAward, FiShare2 } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactSection from '../../components/ContactSection';
import NewsletterSection from '../../components/NewsletterSection';
import SkipSearchPopup from '../../components/SkipSearchPopup';
import DOMPurify from 'dompurify';
import TestimonialsSection from '../../components/TestimonialsSection';
import PartnersSection from '../../components/PartnersSection';

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

const CorporateTeambuildingDetail = () => {
  const { "landing-page": landingPage } = useParams<{ "landing-page": string }>();
  const [teambuilding, setTeambuilding] = useState<CorporateTeambuilding | null>(null);
  const [similarTeambuildings, setSimilarTeambuildings] = useState<CorporateTeambuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkipSearchPopup, setShowSkipSearchPopup] = useState(false);

  useEffect(() => {
    const fetchTeambuilding = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/corporate_teambuildings?slug=eq.${landingPage}&select=*`,
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
          if (data.length > 0) {
            setTeambuilding(data[0]);
            fetchSimilarTeambuildings(data[0].id);
          } else {
            setError('Corporate teambuilding not found');
          }
        } else {
          console.error('Error response:', await response.text());
          setError('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching corporate teambuilding:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarTeambuildings = async (excludeId: number) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/corporate_teambuildings?id=neq.${excludeId}&select=*&limit=3`,
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
          setSimilarTeambuildings(data);
        } else {
          console.error('Error fetching similar corporate teambuildings:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching similar corporate teambuildings:', error);
      }
    };

    if (landingPage) {
      fetchTeambuilding();
    }
  }, [landingPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      DOMPurify.addHook('afterSanitizeAttributes', function(node) {
        if (node instanceof HTMLElement) {
          const attributes = node.attributes;
          for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (attr.name.startsWith('data-')) {
            }
          }
        }
        
        if (node.hasAttribute('id')) {
        }
      });
    }
  }, []);

  const handleShare = async () => {
    try {
      if (navigator.share && teambuilding) {
        await navigator.share({
          title: teambuilding.name,
          text: teambuilding.tagline,
          url: window.location.href
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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
        <title>{teambuilding.name} | Corporate Team Building | Trebound</title>
        <meta name="description" content={teambuilding.meta_description || teambuilding.tagline} />
        <meta name="keywords" content={`${teambuilding.target_keyword}, corporate team building, team development, ${teambuilding.name.toLowerCase()}`} />
        <meta name="author" content="Trebound" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Trebound" />
        <meta property="og:title" content={`${teambuilding.name} | Corporate Team Building | Trebound`} />
        <meta property="og:description" content={teambuilding.meta_description || teambuilding.tagline} />
        <meta property="og:image" content={teambuilding.hero_image || teambuilding.card_1_image} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${teambuilding.name} | Corporate Team Building | Trebound`} />
        <meta name="twitter:description" content={teambuilding.meta_description || teambuilding.tagline} />
        <meta name="twitter:image" content={teambuilding.hero_image || teambuilding.card_1_image} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={window.location.href} />
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
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {teambuilding.button_text || "Partner with Us"}
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-1 lg:order-2"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={teambuilding.hero_image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80"} 
                    alt={teambuilding.name}
                    className="w-full aspect-[4/3] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80";
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">
                  {teambuilding.heading_2 || "Transform Your Team With Our Specialized Program"}
                </h2>
                <div 
                  className="text-lg text-gray-700 mb-8 prose prose-lg"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(teambuilding.heading_2_argument) || "Our corporate team building solutions are designed to address the specific challenges your organization faces while creating memorable experiences that inspire and motivate your team."
                  }}
                />
                <div className="space-y-4">
                  {[
                    "Foster stronger interpersonal relationships",
                    "Improve communication and collaboration",
                    "Develop leadership and problem-solving skills",
                    "Boost morale and team spirit"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mr-3 mt-1 text-[#FF4C39]">
                        <FiCheck className="w-5 h-5" />
                      </div>
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={teambuilding.card_2_image || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80"}
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80";
                  }}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {teambuilding.post_body && (
          <section className="py-20 px-4 lg:px-8 bg-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div 
                className="prose prose-lg max-w-none [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:font-outfit [&>h1]:mb-8 
                           [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:font-outfit [&>h2]:mb-6 [&>h2]:mt-12
                           [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:font-outfit [&>h3]:mb-4 [&>h3]:mt-8
                           [&>p]:text-gray-600 [&>p]:leading-relaxed [&>p]:mb-6 [&>p]:text-lg
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:text-gray-600 [&>ul>li]:mb-2
                           [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:text-gray-600 [&>ol>li]:mb-2
                           [&>blockquote]:border-l-4 [&>blockquote]:border-[#FF4C39] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-700 [&>blockquote]:my-8
                           [&>img]:rounded-xl [&>img]:shadow-lg [&>img]:my-8 [&>img]:w-full [&>img]:max-w-full
                           [&>a]:text-[#FF4C39] [&>a]:no-underline [&>a]:font-medium [&>a]:transition-colors [&>a:hover]:text-[#FFB573]
                           [&>table]:w-full [&>table]:my-8 [&>table]:border-collapse
                           [&>table>thead>tr>th]:bg-gray-100 [&>table>thead>tr>th]:p-3 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-gray-300
                           [&>table>tbody>tr>td]:p-3 [&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-gray-300
                           [&>iframe]:w-full [&>iframe]:my-8 [&>iframe]:rounded-xl [&>iframe]:shadow-lg [&>iframe]:max-w-full [&>iframe]:aspect-video
                           [&>figure]:my-8 [&>figure]:max-w-full [&>figure>img]:rounded-xl [&>figure>img]:shadow-lg [&>figure>figcaption]:text-center [&>figure>figcaption]:text-gray-500 [&>figure>figcaption]:mt-2
                           [&>hr]:my-12 [&>hr]:border-gray-200
                           [&>div]:my-6 [&>div>*]:my-2
                           [&_p[id]]:text-gray-600 [&_p[id]]:leading-relaxed [&_p[id]]:mb-6 [&_p[id]]:text-lg
                           [&_div[id]]:my-6 [&_div[id]>*]:my-2
                           [&_span[id]]:inline-block"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(teambuilding.post_body || '', {
                    ADD_ATTR: ['target', 'class', 'style', 'id', 'data-*'],
                    ADD_TAGS: ['iframe'],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'class', 'style', 'width', 'height', 'frameborder', 'allowfullscreen', 'id', 'data-*']
                  })
                }}
              />
            </motion.div>
          </section>
        )}

        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">
                {teambuilding.heading_3 || "Why This Program Works"}
              </h2>
              <div 
                className="text-xl text-gray-700 max-w-3xl mx-auto prose prose-lg"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeHtml(teambuilding.heading_3_argument_1) || "Our approach combines proven team psychology with engaging activities to deliver measurable results for your organization."
                }}
              />
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
                  title: teambuilding.reason_1_heading || "Collaborative Approach",
                  description: teambuilding.reason_1_paragraph || "Engaging activities that encourage teamwork and open communication among participants."
                },
                {
                  icon: <FiTarget className="w-12 h-12" />,
                  title: teambuilding.reason_2_heading || "Goal-Oriented Design",
                  description: teambuilding.reason_2_paragraph || "Custom-designed experiences aligned with your specific organizational objectives."
                },
                {
                  icon: <FiAward className="w-12 h-12" />,
                  title: teambuilding.reason_3_heading || "Lasting Impact",
                  description: teambuilding.reason_3_paragraph || "Programs that create meaningful changes in behavior and team dynamics long after the event."
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
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

        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-16 text-center font-outfit"
            >
              {teambuilding.special_section_heading || "Special Features of This Program"}
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {[
                {
                  title: teambuilding.card_1_heading || "Custom Activity Design",
                  image: teambuilding.card_1_image || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
                },
                {
                  title: teambuilding.card_2_heading || "Expert Facilitation",
                  image: teambuilding.card_2_image || "https://images.unsplash.com/photo-1522071901873-411886a10004?auto=format&fit=crop&q=80"
                },
                {
                  title: teambuilding.card_3_heading || "Post-Program Assessment",
                  image: teambuilding.card_3_image || "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80"
                },
                {
                  title: teambuilding.card_4_heading || "Follow-Up Resources",
                  image: teambuilding.card_4_image || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="relative rounded-2xl overflow-hidden h-64 group"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <h3 className="text-xl font-semibold text-white p-6">{feature.title}</h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {similarTeambuildings.length > 0 && (
          <section className="py-20 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-outfit">
                  <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                    Explore Similar Programs
                  </span>
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] mx-auto rounded-full"></div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {similarTeambuildings.map((similar) => (
                  <motion.div
                    key={similar.id}
                    variants={fadeInUp}
                    className="rounded-xl overflow-hidden bg-white shadow-xl transition-all duration-300 hover:shadow-2xl h-full flex flex-col"
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Link to={`/corporate-teambuilding/${similar.slug}`} className="block h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            similar.hero_image || 
                            similar.card_1_image || 
                            "https://images.unsplash.com/photo-1565398305589-6a82dc61ce9c?auto=format&fit=crop&q=80"
                          }
                          alt={similar.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1565398305589-6a82dc61ce9c?auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-gray-900/70 to-transparent w-full h-1/3"></div>
                      </div>
                      
                      <div className="p-6 flex-grow flex flex-col">          
                        <h3 className="text-xl font-medium text-primary mb-3 line-clamp-2 font-outfit">
                          {similar.name}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                          {similar.tagline || "Specialized corporate teambuilding program designed to enhance collaboration and productivity in your organization."}
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
            </div>
          </section>
        )}

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
                <FiArrowRight className="ml-2 w-5 h-5" />
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