import { motion } from 'framer-motion';

interface StayCTASectionProps {
  stayName: string;
  destinationName: string;
  location?: string;
}

const StayCTASection = ({ stayName, destinationName }: StayCTASectionProps) => {
  // Helper function to clean stay name by removing any "Team Outing" variations
  const cleanStayName = (name: string) => {
    if (!name) return '';
    // Remove various "Team Outing" patterns at the beginning
    return name
      .replace(/^Team Outing at\s*/i, '')
      .replace(/^Team Outing\s*/i, '')
      .replace(/^Team outing at\s*/i, '')
      .replace(/^Team outing\s*/i, '')
      .trim();
  };



  return (
    <section className="w-full bg-white py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with refined typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#FF4C39]/10 to-[#FFB573]/10 rounded-full mb-6">
            <span className="text-sm font-medium text-[#FF4C39] tracking-wide uppercase">Team Outing Experience</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-6 font-outfit leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Ready to Plan Your
            <br />
            <span className="text-[#FF4C39]">{cleanStayName(stayName)}</span> Experience?
          </h2>
          
          <p className="text-lg sm:text-xl text-[#666] max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Get a personalized quote for your team outing at this beautiful resort. 
            We'll handle everything from planning to execution.
          </p>

          {/* Stats Section - Apple-style clean design */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF4C39] to-[#FFB573] rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[#1a1a1a]">{destinationName}</div>
                <div className="text-sm text-[#666] font-medium">Premium Location</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF4C39] to-[#FFB573] rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[#1a1a1a]">10-300</div>
                <div className="text-sm text-[#666] font-medium">Team Size</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF4C39] to-[#FFB573] rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[#1a1a1a]">24hr</div>
                <div className="text-sm text-[#666] font-medium">Response Time</div>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const formSection = document.getElementById('stay-booking-form');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF4C39]/30 focus:ring-offset-2 group"
          >
            Plan My Team Outing
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.button>

          <p className="text-sm text-[#999] mt-4 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-[#FF4C39]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Free consultation • No commitment required • Quick 24hr response
          </p>
        </motion.div>

        {/* Benefits Grid - Minimalist Apple-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#FF4C39]/20 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF4C39]/10 to-[#FFB573]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#FF4C39]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-[#1a1a1a] mb-3 font-outfit">Expert Planning</h4>
            <p className="text-[#666] leading-relaxed">10+ years organizing memorable team experiences at premium locations</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#FF4C39]/20 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF4C39]/10 to-[#FFB573]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#FF4C39]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-[#1a1a1a] mb-3 font-outfit">Custom Packages</h4>
            <p className="text-[#666] leading-relaxed">Tailored team building activities that match your group's unique needs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#FF4C39]/20 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF4C39]/10 to-[#FFB573]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#FF4C39]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-[#1a1a1a] mb-3 font-outfit">Best Rates</h4>
            <p className="text-[#666] leading-relaxed">Competitive pricing with transparent costs and no hidden booking fees</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#FF4C39]/20 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#FF4C39]/10 to-[#FFB573]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-[#FF4C39]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-[#1a1a1a] mb-3 font-outfit">Full Support</h4>
            <p className="text-[#666] leading-relaxed">End-to-end assistance from initial planning to post-event follow-up</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StayCTASection; 