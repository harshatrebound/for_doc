import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/Navbar';
import TestimonialsSection from '../../components/TestimonialsSection';
import PartnersSection from '../../components/PartnersSection';
import ContactSection from '../../components/ContactSection';
import Footer from '../../components/Footer';

// Add custom styles
const styles = {
  textShadow: {
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)'
  }
};

const CorporateGiftingPage: React.FC = () => {
  const [solutionsRef, solutionsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [benefitsRef, benefitsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [productsRef, productsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [ctaRef, ctaInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [processRef, processInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Customized Corporate Gifting Solutions | Trebound</title>
        <meta name="description" content="Premium corporate gifting solutions tailored to your brand and budget" />
      </Helmet>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Similar to Homepage */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full object-cover"
            style={{
              backgroundImage: "url('/images/Corporate Gifting.jpg')", // Updated image path
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
              Premium Corporate Gifting Solutions
            </motion.h2>
            <motion.h1
              className="text-[64px] font-bold text-white mb-6 font-outfit leading-[74.6px] tracking-tight"
            >
              Customized Corporate<br />
              Gifting Solutions
            </motion.h1>
          </motion.div>
        </div>
      </section>

      {/* Corporate Gifting Solutions Section */}
      <section ref={solutionsRef} className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-[#002B4F] mb-6"
            >
              Corporate Gifting Solutions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-lg max-w-3xl mx-auto"
            >
              Discover our range of premium corporate gifting solutions designed to strengthen relationships and create lasting impressions
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Solution Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-1.jpg"
                  alt="Employee Recognition"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Employee Recognition</h3>
                <p className="text-gray-600">Celebrate milestones and achievements with thoughtfully curated gift packages</p>
              </div>
            </motion.div>

            {/* Solution Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-2.jpg"
                  alt="Client Appreciation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Client Appreciation</h3>
                <p className="text-gray-600">Strengthen business relationships with premium corporate gifts</p>
              </div>
            </motion.div>

            {/* Solution Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-3.jpg"
                  alt="Event Merchandise"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Event Merchandise</h3>
                <p className="text-gray-600">Custom branded merchandise for corporate events and conferences</p>
              </div>
            </motion.div>

            {/* Solution Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-4.jpg"
                  alt="Wellness Packages"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Wellness Packages</h3>
                <p className="text-gray-600">Promote employee well-being with curated wellness gift sets</p>
              </div>
            </motion.div>

            {/* Solution Card 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-5.jpg"
                  alt="Festival Celebrations"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Festival Celebrations</h3>
                <p className="text-gray-600">Special gift collections for festive occasions and celebrations</p>
              </div>
            </motion.div>

            {/* Solution Card 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-6.jpg"
                  alt="Welcome Kits"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Welcome Kits</h3>
                <p className="text-gray-600">Make a great first impression with customized welcome packages</p>
              </div>
            </motion.div>

            {/* Solution Card 7 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-7.jpg"
                  alt="Anniversary Gifts"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Anniversary Gifts</h3>
                <p className="text-gray-600">Celebrate work anniversaries with meaningful gifts</p>
              </div>
            </motion.div>

            {/* Solution Card 8 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-8.jpg"
                  alt="Retirement Gifts"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Retirement Gifts</h3>
                <p className="text-gray-600">Honor retiring employees with memorable gift selections</p>
              </div>
            </motion.div>

            {/* Solution Card 9 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src="/images/corporate-gift-9.jpg"
                  alt="Custom Awards"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#002B4F] mb-4">Custom Awards</h3>
                <p className="text-gray-600">Recognize excellence with personalized awards and trophies</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits of Corporate Gifts Section */}
      <section ref={benefitsRef} className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-[#002B4F] mb-6"
            >
              Benefits of Corporate Gifts
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-lg max-w-3xl mx-auto"
            >
              Discover how corporate gifting can transform your business relationships
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Benefit Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L1 21h22L12 2zm0 3.83L19.17 19H4.83L12 5.83zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Strengthen Relationships</h3>
              <p className="text-gray-600">Build lasting connections with clients and employees</p>
            </motion.div>

            {/* Benefit Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-3xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V18h14v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05.02.01.03.03.04.04 1.14.83 1.93 1.94 1.93 3.41V18h6v-1.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Boost Employee Morale</h3>
              <p className="text-gray-600">Motivate and appreciate your team members</p>
            </motion.div>

            {/* Benefit Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Brand Recognition</h3>
              <p className="text-gray-600">Enhance your brand visibility and recall</p>
            </motion.div>

            {/* Benefit Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-3xl p-8 shadow-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-4h4v-2h-4V7h-2v4H8v2h4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002B4F] mb-4">Business Growth</h3>
              <p className="text-gray-600">Drive customer loyalty and retention</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ready to Impress Section */}
      <section ref={ctaRef} className="py-24 bg-[#002B4F] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#002B4F] to-[#001F3F] opacity-90" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Ready to Impress?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl text-white/90 mb-12"
            >
              Send Personalized Gifts to Your Team Today!
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white text-lg font-bold py-4 px-8 rounded-full hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
            >
              Get Started Now
            </motion.button>
          </div>
        </div>
      </section>

      {/* Our Products Section */}
      <section ref={productsRef} className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-[#002B4F] mb-6"
            >
              Our Products
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-lg max-w-3xl mx-auto"
            >
              Explore our curated collection of premium corporate gifts
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Product Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-1.jpg"
                  alt="Employee Recognition"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Employee Recognition</h3>
                <p className="text-gray-600 text-sm mb-4">Celebrate milestones and achievements with thoughtfully curated gift packages</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹2999</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-2.jpg"
                  alt="Client Appreciation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Client Appreciation</h3>
                <p className="text-gray-600 text-sm mb-4">Strengthen business relationships with premium corporate gifts</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹4999</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-3.jpg"
                  alt="Event Merchandise"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Event Merchandise</h3>
                <p className="text-gray-600 text-sm mb-4">Custom branded merchandise for corporate events and conferences</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹999</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-4.jpg"
                  alt="Wellness Packages"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Wellness Packages</h3>
                <p className="text-gray-600 text-sm mb-4">Promote employee well-being with curated wellness gift sets</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹4999</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-5.jpg"
                  alt="Festival Celebrations"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Festival Celebrations</h3>
                <p className="text-gray-600 text-sm mb-4">Special gift collections for festive occasions and celebrations</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹3499</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-6.jpg"
                  alt="Welcome Kits"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Welcome Kits</h3>
                <p className="text-gray-600 text-sm mb-4">Make a great first impression with customized welcome packages</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹1499</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 7 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-7.jpg"
                  alt="Anniversary Gifts"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Anniversary Gifts</h3>
                <p className="text-gray-600 text-sm mb-4">Celebrate work anniversaries with meaningful gifts</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹2499</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 8 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-8.jpg"
                  alt="Retirement Gifts"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Retirement Gifts</h3>
                <p className="text-gray-600 text-sm mb-4">Honor retiring employees with memorable gift selections</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹5999</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 9 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-9.jpg"
                  alt="Custom Awards"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Custom Awards</h3>
                <p className="text-gray-600 text-sm mb-4">Recognize excellence with personalized awards and trophies</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹1999</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 10 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-10.jpg"
                  alt="Event Merchandise"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Event Merchandise</h3>
                <p className="text-gray-600 text-sm mb-4">Custom branded merchandise for corporate events and conferences</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹1499</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>

            {/* Product Card 11 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden group cursor-pointer"
            >
              <div className="h-48 relative overflow-hidden">
                <img
                  src="/images/product-11.jpg"
                  alt="Client Appreciation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#002B4F] mb-2">Client Appreciation</h3>
                <p className="text-gray-600 text-sm mb-4">Strengthen business relationships with premium corporate gifts</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#FF5A3C] font-bold">Starting from ₹3999</span>
                  <button className="text-[#002B4F] font-bold hover:text-[#FF5A3C]">View Details →</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section ref={processRef} className="py-24 bg-[#002B4F]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={processInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-white text-lg mb-4"
            >
              How We Work
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={processInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent mb-16"
            >
              Our Gifting Process
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto text-white">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center text-3xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4">Consultation</h3>
                <p className="text-gray-300">Understanding your requirements and budget</p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center text-3xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Curation</h3>
                <p className="text-gray-300">Selecting perfect gifts that align with your brand</p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center text-3xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Customization</h3>
                <p className="text-gray-300">Adding your brand elements and personal touches</p>
              </motion.div>

              {/* Step 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF4C39] to-[#FFB573] flex items-center justify-center text-3xl font-bold">
                  4
                </div>
                <h3 className="text-2xl font-bold mb-4">Delivery</h3>
                <p className="text-gray-300">Timely delivery to your specified locations</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Partners Section */}
      <PartnersSection />

      {/* CTA Section */}
      <ContactSection />

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-[#002B4F] mb-6"
            >
              Frequently asked questions
            </motion.h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                question: "What types of corporate gifts do you offer?",
                answer: "At Trebound, we offer a wide range of corporate gifts including personalized gifts, employee gifts, client gifts, new employee welcome kits, customized t-shirts, curated gift boxes, backpacks, swags, luxury gift sets, tech gadgets, and more."
              },
              {
                question: "Can I customize the corporate gifts with our company logo?",
                answer: "Yes, absolutely! We offer customization options including adding your company logo to the corporate gifts to align with your branding."
              },
              {
                question: "Do you provide bulk order discounts?",
                answer: "Yes, we offer bulk order discounts for corporate gifts. Get in touch with us to discuss your requirements and avail of special pricing for large orders."
              },
              {
                question: "Can I request a sample of the corporate gift before placing a bulk order?",
                answer: "Yes, we understand the importance of ensuring the quality and suitability of the corporate gifts. Contact us to request a sample before placing your bulk order."
              },
              {
                question: "How long does it take to receive our corporate gifts?",
                answer: "The delivery time depends on the customization and quantity of your order. We strive to deliver your gifts within the specified timeframe and will provide you with an estimated delivery date upon order confirmation."
              }
            ].map((faq, index) => (
              <div key={index} className="mb-6">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none bg-white rounded-2xl shadow-md p-6">
                    <span className="text-xl font-bold text-[#002B4F]">{faq.question}</span>
                    <span className="text-[#FF5A3C] font-bold text-2xl transition-transform duration-300 group-open:rotate-180">
                      -
                    </span>
                  </summary>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CorporateGiftingPage; 