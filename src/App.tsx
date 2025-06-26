import { Helmet } from 'react-helmet-async';
import { useEffect, useState, lazy, Suspense } from 'react';
import Analytics from './components/Analytics';
import CustomAnalytics from './components/CustomAnalytics';
import PerformanceMonitor from './components/PerformanceMonitor';
import { initializeGCLIDTracking } from './lib/gclid';
import Navbar from './components/Navbar';
import GradientHero from './components/GradientHero';

// Lazy load non-critical components
const ServicesSection = lazy(() => import('./components/ServicesSection'));
const StepsSection = lazy(() => import('./components/StepsSection'));
const OutboundSection = lazy(() => import('./components/OutboundSection'));
const DestinationsSection = lazy(() => import('./components/DestinationsSection'));
const InboundSection = lazy(() => import('./components/InboundSection'));
const BlogSection = lazy(() => import('./components/BlogSection'));
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection'));
const PartnersSection = lazy(() => import('./components/PartnersSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

// Loading fallback component
const SectionLoader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-pulse w-full max-w-4xl mx-auto px-4">
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

function App() {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
    
    // Initialize GCLID tracking for Google Ads
    initializeGCLIDTracking();
  }, []);

  return (
    <>
      <Analytics />
      <CustomAnalytics />
      <PerformanceMonitor />
      <Helmet>
        <title>Trebound | Premium Team Building & Corporate Events Solutions</title>
        <meta 
          name="description" 
          content="Trebound is your trusted partner for exceptional team building experiences and corporate events. We create transformative experiences that strengthen teams and drive success."
        />
        <meta name="keywords" content="team building, corporate events, team development, outbound training, corporate retreats, employee engagement" />
        <meta name="author" content="Trebound" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Trebound" />
        <meta property="og:title" content="Trebound | Premium Team Building & Corporate Events Solutions" />
        <meta property="og:description" content="Trebound is your trusted partner for exceptional team building experiences and corporate events. We create transformative experiences that strengthen teams and drive success." />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:image" content="/trebound_logos_icons/favicons/Trebound_Favicon_blue-32px.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trebound | Premium Team Building & Corporate Events Solutions" />
        <meta name="twitter:description" content="Trebound is your trusted partner for exceptional team building experiences and corporate events. We create transformative experiences that strengthen teams and drive success." />
        <meta name="twitter:image" content="/trebound_logos_icons/favicons/Trebound_Favicon_blue-32px.jpg" />
        
        {/* Additional SEO */}
        <link rel="canonical" href={currentUrl} />
      </Helmet>

      <div className="relative min-h-screen overflow-x-hidden bg-white">
        <Navbar />
        <GradientHero />
        
        {/* Lazy load all sections below the fold */}
        <Suspense fallback={<SectionLoader />}>
          <ServicesSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <StepsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <OutboundSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <DestinationsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <InboundSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <BlogSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PartnersSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ContactSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
}

export default App;
