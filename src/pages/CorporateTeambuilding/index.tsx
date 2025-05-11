import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiUsers, FiTarget, FiBriefcase, FiArrowDown, FiAward, FiSmile } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import NewsletterSection from '../../components/NewsletterSection';
import ContactSection from '../../components/ContactSection';
import TeamSection from '../../components/TeamSection';
import TestimonialsSection from '../../components/TestimonialsSection';
import PartnersSection from '../../components/PartnersSection';

const CorporateTeamBuildingActivities: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Fun & Engaging Corporate Team Building Activities | Trebound</title>
        <meta 
          name="description" 
          content="Transform your team with engaging corporate team building activities. Keep your employees happy, engaged and energized with our diverse range of team building solutions." 
        />
        <link rel="canonical" href="https://www.trebound.com/corporate-team-building-activities" />
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
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a 
              href="#contact"
              className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white px-8 py-4 rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300"
            >
              Get Started
            </a>
            <a 
              href="#activities"
              className="bg-white text-[#002B4F] px-8 py-4 rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300"
            >
              View Activities
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <FiArrowDown className="text-white text-4xl animate-bounce" />
        </motion.div>
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