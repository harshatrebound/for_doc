import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabaseClient';
import PartnersSection from '../../components/PartnersSection';

interface JobListing {
  id: number;
  name: string;
  job_location: string;
  employment_basis: string;
  job_listing_body: string;
}

interface ApplicationForm {
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  portfolioUrl: string;
  coverLetter: string;
  experienceYears: string;
  currentCompany: string;
  noticePeriod: string;
  expectedSalary: string;
}

const JobsPage = () => {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ApplicationForm>({
    fullName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    portfolioUrl: '',
    coverLetter: '',
    experienceYears: '',
    currentCompany: '',
    noticePeriod: '',
    expectedSalary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchJobListings();
  }, []);

  const fetchJobListings = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobListings(data || []);
    } catch (error) {
      console.error('Error fetching job listings:', error);
    }
  };

  const handleApply = (job: JobListing) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([
          {
            job_listing_id: selectedJob.id,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            resume_url: formData.resumeUrl,
            portfolio_url: formData.portfolioUrl,
            cover_letter: formData.coverLetter,
            experience_years: parseInt(formData.experienceYears),
            current_company: formData.currentCompany,
            notice_period: formData.noticePeriod,
            expected_salary: formData.expectedSalary
          }
        ]);

      if (error) throw error;

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsFormOpen(false);
        setSelectedJob(null);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          resumeUrl: '',
          portfolioUrl: '',
          coverLetter: '',
          experienceYears: '',
          currentCompany: '',
          noticePeriod: '',
          expectedSalary: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Careers at Trebound | Join Our Team | Job Opportunities</title>
        <meta 
          name="description" 
          content="Join Trebound's dynamic team and be part of creating exceptional corporate experiences. Explore exciting career opportunities in team building and event management."
        />
        <meta name="keywords" content="careers, jobs, employment, team building careers, event management jobs, corporate events careers" />
        <meta name="author" content="Trebound" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Trebound" />
        <meta property="og:title" content="Careers at Trebound | Join Our Team | Job Opportunities" />
        <meta property="og:description" content="Join Trebound's dynamic team and be part of creating exceptional corporate experiences. Explore exciting career opportunities in team building and event management." />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Careers at Trebound | Join Our Team | Job Opportunities" />
        <meta name="twitter:description" content="Join Trebound's dynamic team and be part of creating exceptional corporate experiences. Explore exciting career opportunities in team building and event management." />
        
        {/* Additional SEO */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-[1448px] mx-auto px-4 md:px-8 lg:px-16 flex flex-col justify-center items-center text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Outfit'] mb-4"
            >
              Bring Your Talent
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Outfit'] mb-8"
            >
              to Our Team!
            </motion.h2>
          </div>
        </section>

        {/* Culture Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1448px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
              <h2 className="text-2xl md:text-3xl font-bold font-['Outfit']">
                <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                  Exceptional Work Starts with an Amazing Culture.
                </span>
              </h2>
              <p className="text-[#636363] text-lg md:text-right max-w-md">
                Great culture fuels exceptional work.<br />
                Discover the difference with us.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Culture Cards */}
              <div className="bg-[#F3F3F3] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
                <span className="text-[#FF4C39] font-['Outfit'] text-lg mb-4 block">01</span>
                <h3 className="text-xl font-bold mb-2 text-[#FF4C39]">Achieve big</h3>
                <p className="text-[#636363] text-base font-['DM Sans']">Every day, we are excited to push the limits and make extraordinary results.</p>
              </div>

              <div className="bg-[#F3F3F3] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
                <span className="text-[#FF4C39] font-['Outfit'] text-lg mb-4 block">02</span>
                <h3 className="text-xl font-bold mb-2 text-[#FF4C39]">Many minds, one goal</h3>
                <p className="text-[#636363] text-base font-['DM Sans']">The only masterpiece we believe in is teamwork. We give birth to one best out of many ideas.</p>
              </div>

              <div className="bg-[#F3F3F3] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
                <span className="text-[#FF4C39] font-['Outfit'] text-lg mb-4 block">03</span>
                <h3 className="text-xl font-bold mb-2 text-[#FF4C39]">Expect the best</h3>
                <p className="text-[#636363] text-base font-['DM Sans']">In a world of no limitations, we strive to push forward with a clear and positive attitude.</p>
              </div>

              <div className="bg-[#F3F3F3] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
                <span className="text-[#FF4C39] font-['Outfit'] text-lg mb-4 block">04</span>
                <h3 className="text-xl font-bold mb-2 text-[#FF4C39]">100% candid, 0% ego</h3>
                <p className="text-[#636363] text-base font-['DM Sans']">We embrace radiance as a chance to innovate and motivate.</p>
              </div>

              <div className="bg-[#F3F3F3] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
                <span className="text-[#FF4C39] font-['Outfit'] text-lg mb-4 block">05</span>
                <h3 className="text-xl font-bold mb-2 text-[#FF4C39]">Less talk, do more</h3>
                <p className="text-[#636363] text-base font-['DM Sans']">Creating is time well spent. We make the most of every project.</p>
              </div>

              <div className="bg-[#F3F3F3] rounded-[20px] p-8 hover:shadow-lg transition-all duration-300">
                <span className="text-[#FF4C39] font-['Outfit'] text-lg mb-4 block">06</span>
                <h3 className="text-xl font-bold mb-2 text-[#FF4C39]">Chilled-out Fridays</h3>
                <p className="text-[#636363] text-base font-['DM Sans']">We prioritize experience over burnout to let balance with relaxed minds and creative minds.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Office Images Section */}
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1448px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#636363] text-lg mb-2 font-['DM Sans']">Where Creativity and Collaboration come to life!</p>
              <h2 className="text-2xl md:text-3xl font-bold font-['Outfit']">
                <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                  Our Happy Place
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[20px] overflow-hidden aspect-video md:aspect-square group relative">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069"
                  alt="Modern office space with large windows"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="rounded-[20px] overflow-hidden aspect-video md:aspect-square group relative">
                <img 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070"
                  alt="Clean desk setup with laptop"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="rounded-[20px] overflow-hidden aspect-video md:aspect-square group relative">
                <img 
                  src="https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?q=80&w=2070"
                  alt="Motivational wall art"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1448px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#636363] text-lg mb-2 font-['DM Sans']">Openings</p>
              <h2 className="text-2xl md:text-3xl font-bold font-['Outfit']">
                <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                  Play Your Big Role
                </span>
              </h2>
            </div>
            <div className="space-y-4">
              {jobListings.map((job) => (
                <div 
                  key={job.id}
                  className="bg-[#F3F3F3] rounded-[20px] p-6 md:p-8 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2 font-['Outfit']">{job.name}</h3>
                      <p className="text-[#636363] font-['DM Sans']">
                        {job.employment_basis} • {job.job_location}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApply(job)}
                      className="px-6 py-3 bg-white rounded-lg border border-[#b1b1b1] text-[#636363] hover:bg-gradient-to-r hover:from-[#FF4C39] hover:to-[#FFB573] hover:text-white hover:border-transparent transition-all duration-300 font-['DM Sans']"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form Modal */}
        <AnimatePresence>
          {isFormOpen && selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[20px] p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold font-['Outfit']">Apply for {selectedJob.name}</h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL *</label>
                      <input
                        type="url"
                        required
                        value={formData.resumeUrl}
                        onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                        placeholder="Drive/Dropbox link"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                      <input
                        type="url"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
                      <input
                        type="number"
                        required
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                      <input
                        type="text"
                        value={formData.currentCompany}
                        onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                      <input
                        type="text"
                        value={formData.noticePeriod}
                        onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                        placeholder="e.g., 30 days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                      <input
                        type="text"
                        value={formData.expectedSalary}
                        onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                        placeholder="e.g., 10-12 LPA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                    <textarea
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4C39] focus:border-transparent"
                      placeholder="Tell us why you're interested in this role..."
                    />
                  </div>

                  {submitError && (
                    <p className="text-red-500 text-sm">{submitError}</p>
                  )}

                  {submitSuccess && (
                    <p className="text-green-500 text-sm">Application submitted successfully!</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Section */}
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-[#003366] via-[#002244] to-[#001a33]">
          <div className="max-w-[1448px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-['Outfit']">
              Send your resume and portfolio links to
            </h2>
            <a 
              href="mailto:connect@trebound.com"
              className="text-2xl md:text-3xl text-[#FF4C39] hover:text-[#FFB573] transition-colors font-['Outfit']"
            >
              connect@trebound.com
            </a>
            <p className="text-white/80 mt-4">
              If shortlisted, the team will reach out.
            </p>
          </div>
        </section>

        {/* Partners Section */}
        <PartnersSection />

        <Footer />
      </div>
    </>
  );
};

export default JobsPage; 