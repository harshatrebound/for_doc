import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogMainSection from '../components/BlogMainSection';
import NewsletterSection from '../components/NewsletterSection';

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog | Team Building Insights & Corporate Event Tips | Trebound</title>
        <meta 
          name="description" 
          content="Explore Trebound's blog for expert insights on team building, corporate events, leadership development, and workplace culture. Stay updated with the latest trends and best practices."
        />
        <meta name="keywords" content="team building blog, corporate events blog, leadership development, workplace culture, event management tips" />
        <meta name="author" content="Trebound" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Trebound" />
        <meta property="og:title" content="Blog | Team Building Insights & Corporate Event Tips | Trebound" />
        <meta property="og:description" content="Explore Trebound's blog for expert insights on team building, corporate events, leadership development, and workplace culture. Stay updated with the latest trends and best practices." />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | Team Building Insights & Corporate Event Tips | Trebound" />
        <meta name="twitter:description" content="Explore Trebound's blog for expert insights on team building, corporate events, leadership development, and workplace culture. Stay updated with the latest trends and best practices." />
        
        {/* Additional SEO */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="relative min-h-screen overflow-x-hidden bg-white">
        {/* Main Navigation */}
        <Navbar />
        
        <main className="pt-24">
          {/* Blog Posts Section */}
          <BlogMainSection />

          {/* Newsletter Section */}
          <NewsletterSection />

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Blog; 