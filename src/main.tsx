import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { generateSitemap } from './utils/sitemapGenerator'
import './index.css'
import App from './App'
import TeamOutingRegions from './pages/TeamOutingRegions'
import Destinations from './pages/Destinations'
import CorporateTeamOutingPlaces from './pages/CorporateTeamOutingPlaces'
import DestinationDetail from './pages/DestinationDetail'
import StayDetail from './pages/StayDetail'
import Stays from './pages/Stays'
import TeamOutings from './pages/TeamOutings'
import TeamOutingDetail from './pages/TeamOutingDetail'
import Activities from './pages/Activities'
import ActivityDetail from './pages/ActivityDetail'
import JobsPage from './pages/Jobs'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import TeamBuilding from './pages/TeamBuilding'
import TeamBuildingDetail from './pages/TeamBuilding/[slug]'
import CorporateTeambuilding from './pages/CorporateTeambuilding'
import CorporateTeambuildingDetail from './pages/CorporateTeambuilding/[slug]'
import { CombinedProvider } from './contexts/TeamOutingAdsContext'
import CustomizedTrainingPage from './pages/CustomizedTraining'
import CustomizedTrainingDetail from './pages/CustomizedTraining/[slug]'
import ContactPage from './pages/Contact'
import AboutPage from './pages/About'

const emotionCache = createCache({ key: 'css' });

const SitemapComponent = () => {
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const sitemap = await generateSitemap();
        const blob = new Blob([sitemap], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        window.location.href = url;
      } catch (error) {
        console.error('Error generating sitemap:', error);
      }
    };
    fetchSitemap();
  }, []);
  return null;
};

const Root = () => (
  <StrictMode>
    <CacheProvider value={emotionCache}>
      <HelmetProvider>
        <CombinedProvider>
          <Router>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/sitemap.xml" element={<SitemapComponent />} />
              <Route path="/team-outing-regions" element={<TeamOutingRegions />} />
              <Route path="/team-outing-regions/:regionSlug" element={<Destinations />} />
              <Route path="/corporate-team-outing-places" element={<CorporateTeamOutingPlaces />} />
              <Route path="/corporate-team-outing-places/:destinationSlug" element={<DestinationDetail />} />
              <Route path="/stays" element={<Stays />} />
              <Route path="/stays/:staySlug" element={<StayDetail />} />
              <Route path="/team-outings" element={<TeamOutings />} />
              <Route path="/team-outings/:slug" element={<TeamOutingDetail />} />
              <Route path="/team-building-activity" element={<Activities />} />
              <Route path="/team-building-activity/:slug" element={<ActivityDetail />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:blogSlug" element={<BlogPost />} />
              <Route path="/teambuilding" element={<TeamBuilding />} />
              <Route path="/teambuilding/:slug" element={<TeamBuildingDetail />} />
              <Route path="/corporate-teambuilding" element={<CorporateTeambuilding />} />
              <Route path="/corporate-teambuilding/:slug" element={<CorporateTeambuildingDetail />} />
              <Route path="/customized-training" element={<CustomizedTrainingPage />} />
              <Route path="/customized-training/:slug" element={<CustomizedTrainingDetail />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </Router>
        </CombinedProvider>
      </HelmetProvider>
    </CacheProvider>
  </StrictMode>
);

createRoot(document.getElementById('root')!).render(<Root />);
