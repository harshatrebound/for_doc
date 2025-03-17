import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PartnersSection from '../../components/PartnersSection';

// Add custom styles
const styles = {
  textShadow: {
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)'
  }
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    work_email: '',
    phone: '',
    company: '',
    message: '',
    preferred_destination: 'Not specified',
    number_of_pax: 0,
    activity_type: 'exploring',
    page_url: '',
    page_heading: 'Contact Page Form'
  });
  const [submissionStatus, setSubmissionStatus] = useState<{
    success?: boolean;
    message?: string;
    visible: boolean;
  }>({ visible: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      page_url: window.location.href
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus({ visible: false });
    
    // Convert the message to more_details
    const submissionData = {
      ...formData,
      more_details: formData.message
    };
    
    // Remove any extra fields not in the schema
    const finalSubmitData = {
      name: submissionData.name,
      work_email: submissionData.work_email,
      preferred_destination: submissionData.preferred_destination,
      phone: submissionData.phone,
      number_of_pax: submissionData.number_of_pax,
      more_details: submissionData.more_details,
      activity_type: submissionData.activity_type,
      page_url: submissionData.page_url,
      page_heading: submissionData.page_heading
    };
    
    // For debugging - log the data being sent
    console.log('SUBMISSION DATA:', finalSubmitData);
    console.log('Activity type:', typeof finalSubmitData.activity_type, finalSubmitData.activity_type);
    console.log('Number of pax:', typeof finalSubmitData.number_of_pax, finalSubmitData.number_of_pax);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/contact_submissions`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(finalSubmitData)
        }
      );

      // For debugging - log the response status
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

      if (response.ok) {
        // Reset form when successful
        setFormData({
          name: '',
          work_email: '',
          phone: '',
          company: '',
          message: '',
          preferred_destination: 'Not specified',
          number_of_pax: 0,
          activity_type: 'exploring',
          page_url: window.location.href,
          page_heading: 'Contact Page Form'
        });
        setSubmissionStatus({
          success: true,
          message: 'Thank you for your message. We will get back to you shortly.',
          visible: true
        });
        
        setTimeout(() => {
          setSubmissionStatus(prev => ({ ...prev, visible: false }));
        }, 6000);
      } else {
        // Get more detailed error information
        let errorMessage = 'Server responded with an error';
        try {
          const errorData = await response.text();
          console.error('Error response:', response.status, errorData);
          
          // Try to parse as JSON if possible
          try {
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.message || jsonError.error || errorMessage;
          } catch (e) {
            // If not JSON, use the raw text
            if (errorData) errorMessage = errorData;
          }
        } catch (e) {
          console.error('Failed to parse error response', e);
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionStatus({
        success: false,
        message: error instanceof Error ? 
          `Error: ${error.message}` : 
          'There was an error submitting your message. Please try again.',
        visible: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'number_of_pax' ? (parseInt(value) || 0) : value
    }));
  };

  const StatusMessage = () => {
    if (!submissionStatus.visible) return null;
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
            submissionStatus.success
              ? 'bg-gradient-to-r from-[#FF4C39]/10 to-[#FFB573]/10 border border-[#FF4C39]/30'
              : 'bg-red-50 border border-red-200'
          }`}
          role={submissionStatus.success ? "status" : "alert"}
        >
          {submissionStatus.success ? (
            <FiCheckCircle className="text-[#FF4C39] w-5 h-5 flex-shrink-0" />
          ) : (
            <FiAlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
          )}
          <p className={`text-sm ${submissionStatus.success ? 'text-[#FF4C39]' : 'text-red-700'}`}>
            {submissionStatus.message}
          </p>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <Helmet>
        <title>Contact Trebound | Premium Team Building & Corporate Events</title>
        <meta 
          name="description" 
          content="Partner with Trebound for exceptional team building experiences. Let's create transformative corporate events that elevate your team's potential."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2940&auto=format&fit=crop"
              alt="Team Building Excellence"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 
                className="text-base md:text-lg font-bold mb-4 px-3 py-1 inline-block rounded bg-black/30 tracking-wider shadow-lg"
                style={{
                  ...styles.textShadow,
                  color: '#FF5A3C',
                  borderLeft: '3px solid #FF5A3C'
                }}
              >
                YOUR SEARCH FOR THE BEST ENDS HERE
              </h2>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-outfit leading-tight">
                From Fortune 500 giants to cutting-edge start-ups, we've got a decade of experience under our belts.
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto font-dm-sans">
                Just let us know what you're looking for, then kick back and relax.
              </p>
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

        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-base md:text-lg text-[#FF4C39] font-semibold mb-4">
                GET IN TOUCH
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">
                Begin Your{' '}
                <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                  Partnership Journey
                </span>
              </h3>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Share your vision with us, and let's craft exceptional team experiences together
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6 bg-white p-8 rounded-2xl shadow-xl"
              >
                <StatusMessage />
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/20 focus:border-[#FF4C39] transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="work_email" className="block text-sm font-medium text-gray-700 mb-2">
                        Work Email
                      </label>
                      <input
                        type="email"
                        id="work_email"
                        name="work_email"
                        value={formData.work_email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/20 focus:border-[#FF4C39] transition-colors"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/20 focus:border-[#FF4C39] transition-colors"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/20 focus:border-[#FF4C39] transition-colors"
                        placeholder="Company Ltd."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="number_of_pax" className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Participants
                      </label>
                      <input
                        type="number"
                        id="number_of_pax"
                        name="number_of_pax"
                        value={formData.number_of_pax || ''}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/20 focus:border-[#FF4C39] transition-colors"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label htmlFor="activity_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Activity Type
                      </label>
                      <select
                        id="activity_type"
                        name="activity_type"
                        value={formData.activity_type}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/20 focus:border-[#FF4C39] transition-colors"
                      >
                        <option value="outbound">Outbound</option>
                        <option value="virtual">Virtual</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="exploring">Exploring Options</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about your vision
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/20 focus:border-[#FF4C39] transition-colors resize-none"
                      placeholder="Share your team building goals and requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-lg font-medium text-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </form>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                  <h4 className="text-2xl font-bold mb-4 font-outfit">Our Office</h4>
                  <p className="text-gray-600 mb-6">
                    91 Springboard Business Hub Pvt Ltd,<br />
                    Plot No. 175, Industrial Area Phase 1,<br />
                    Chandigarh, 160002
                  </p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#FF4C39] hover:text-[#FFB573] transition-colors"
                  >
                    View on Map
                    <FiArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl">
                  <h4 className="text-2xl font-bold mb-4 font-outfit">Contact Info</h4>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      <span className="font-semibold block">Email:</span>
                      <a href="mailto:partnerships@trebound.com" className="text-[#FF4C39] hover:text-[#FFB573] transition-colors">
                        partnerships@trebound.com
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold block">Phone:</span>
                      <a href="tel:+919876543210" className="text-[#FF4C39] hover:text-[#FFB573] transition-colors">
                        +91 98765 43210
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <PartnersSection />

        <Footer />
      </div>
    </>
  );
};

export default ContactPage; 