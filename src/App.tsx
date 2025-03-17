import { Helmet } from 'react-helmet-async';
import useSkipSearchPopup from './hooks/useSkipSearchPopup';
import SkipSearchPopup from './components/SkipSearchPopup';
import Navbar from './components/Navbar';
import GradientHero from './components/GradientHero';
import ServicesSection from './components/ServicesSection';
import StepsSection from './components/StepsSection';
import OutboundSection from './components/OutboundSection';
import DestinationsSection from './components/DestinationsSection';
import InboundSection from './components/InboundSection';
import BlogSection from './components/BlogSection';
import TestimonialsSection from './components/TestimonialsSection';
import PartnersSection from './components/PartnersSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

function App() {
  const { isVisible, closePopup } = useSkipSearchPopup();

  return (
    <>
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
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/trebound_logos_icons/favicons/Trebound_Favicon_blue-32px.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trebound | Premium Team Building & Corporate Events Solutions" />
        <meta name="twitter:description" content="Trebound is your trusted partner for exceptional team building experiences and corporate events. We create transformative experiences that strengthen teams and drive success." />
        <meta name="twitter:image" content="/trebound_logos_icons/favicons/Trebound_Favicon_blue-32px.jpg" />
        
        {/* Additional SEO */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="relative min-h-screen overflow-x-hidden bg-white">
        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <GradientHero />

          {/* Main Navigation */}
          <Navbar />

          {/* Services Section */}
          <ServicesSection />

          {/* Steps Section */}
          <StepsSection />

          {/* Outbound Experiences */}
          <OutboundSection />

          {/* Top Destinations */}
          <DestinationsSection />

          {/* Inbound Experiences */}
          <InboundSection />

          {/* Blog Section */}
          <BlogSection />

          {/* Testimonials */}
          <TestimonialsSection />

          {/* Partners Section */}
          <PartnersSection />

          {/* Contact Form */}
          <ContactSection />

          {/* Footer */}
          <Footer />
        </main>
        <SkipSearchPopup isVisible={isVisible} onClose={closePopup} />
      </div>
    </>
  );
}

export default App;
