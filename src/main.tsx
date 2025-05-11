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
import VirtualTeamBuildingPage from './pages/VirtualTeamBuilding'
import CorporateGiftingPage from './pages/CorporateGifting'
import ThankYouPage from './pages/ThankYou'
import PrivacyPolicyPage from './pages/PrivacyPolicy'
import TermsAndConditionsPage from './pages/TermsAndConditions'
import OutboundTeamBuildingPage from './pages/OutboundTeamBuilding'
import CorporateTeamOutingsPage from './pages/CorporateTeamOutings'
import CorporateTeamOutingBangalore from './pages/CorporateTeamOutingBangalore'
import GlobalPartnerRegistration from './pages/GlobalPartnerRegistration'
import VirtualTeamBuildingHolidayPage from './pages/VirtualTeamBuildingHoliday'
import OutboundGuidelinesPage from './pages/OutboundGuidelines'
import VirtualGuidelinesPage from './pages/VirtualGuidelines'
import HighEngagingActivitiesPage from './pages/HighEngagingActivities'
import BangaloreResortsPage from './pages/BangaloreResorts'
import CampusToCorporatePage from './pages/CampusToCorporate'
import AmdocsPage from './pages/Amdocs'
import TeamBuildingGames from './pages/TeamBuildingGames'
import CorporateTeamOffsite from './pages/CorporateTeamOffsite'
import TeamEngagementActivities from './pages/TeamEngagementActivities'
import CorporateTeamOutboundTraining from './pages/CorporateTeamOutboundTraining'
import ReturnToOffice from './pages/ReturnToOffice'
import TeamBuildingActivitiesBangalore from './pages/TeamBuildingActivitiesBangalore'
import OneDayOutingBangalore from './pages/OneDayOutingBangalore'
import HighEngagementTeamBuilding from './pages/HighEngagementTeamBuilding'
import CorporateTeamOutingMumbai from './pages/CorporateTeamOutingMumbai'
import CorporateTeamBuildingGames from './pages/CorporateTeamBuildingGames'
import CorporateTeamBuildingActivitiesHyderabad from './pages/CorporateTeamBuildingActivitiesHyderabad'
import OutdoorTeamBuildingActivities from './pages/OutdoorTeamBuilding'
import CorporateTeamBuildingActivities from './pages/CorporateTeamBuildingActivities'
import TeamOutingPlacesHyderabad from './pages/TeamOutingPlacesHyderabad'
import TeamOutingPlacesBangalore from './pages/TeamOutingPlacesBangalore'
import PlanYourTeamOffsiteToday from './pages/PlanYourTeamOffsiteToday'
import OneDayOutingResortsHyderabad from './pages/OneDayOutingResortsHyderabad'
import OvernightTeamOutingNearBangalore from './pages/OvernightTeamOutingNearBangalore'
import CorporateTeamOutingPlacesHyderabad from './pages/CorporateTeamOutingPlacesHyderabad'
import CorporateTeamOutingPlacesBangalore from './pages/CorporateTeamOutingPlacesBangalore'
import FunIndoorTeamBuildingActivities from './pages/FunIndoorTeamBuildingActivities'
import ResortsAroundBangalore from './pages/ResortsAroundBangalore'
import FunVirtualTeamBuildingGames from './pages/FunVirtualTeamBuildingGames'
import OnlineTeamBuildingActivities from './pages/OnlineTeamBuildingActivities'
import VirtualEscapeRoomTeambuildingActivityTrebound from './pages/VirtualEscapeRoomTeambuildingActivityTrebound'
import IcebreakerGamesPage from './pages/IcebreakerGames'
import TeamBuildingActivitiesSmallGroups from './pages/TeamBuildingActivitiesSmallGroups'
import TeamCollaborationGamesPage from './pages/TeamCollaborationGames'
import VirtualTeamBuildingIcebreakerGamesPage from './pages/VirtualTeamBuildingIcebreakerGames'
import TopTeamBuildingActivitiesPage from './pages/TopTeamBuildingActivities'
import TopTeamBuildingActivitiesLargeGroups from './pages/TopTeamBuildingActivitiesLargeGroups'

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
              <Route path="/virtual-team-building" element={<VirtualTeamBuildingPage />} />
              <Route path="/virtual-team-building-activities-for-the-holiday-season" element={<VirtualTeamBuildingHolidayPage />} />
              <Route path="/corporate-gifting" element={<CorporateGiftingPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="/outbound-teambuilding-activities" element={<OutboundTeamBuildingPage />} />
              <Route path="/corporate-team-outings" element={<CorporateTeamOutingsPage />} />
              <Route path="/corporate-team-outing-in-bangalore" element={<CorporateTeamOutingBangalore />} />
              <Route path="/corporate-team-building-activities-in-mumbai" element={<CorporateTeamOutingMumbai />} />
              <Route path="/global-partner-registration" element={<GlobalPartnerRegistration />} />
              <Route path="/onground-dos-donts" element={<OutboundGuidelinesPage />} />
              <Route path="/virtual-dos-donts" element={<VirtualGuidelinesPage />} />
              <Route path="/high-engaging-team-building-activities" element={<HighEngagingActivitiesPage />} />
              <Route path="/discover-the-perfect-setting-for-your-team-in-bangalore" element={<BangaloreResortsPage />} />
              <Route path="/campus-to-corporate" element={<CampusToCorporatePage />} />
              <Route path="/amdocs" element={<AmdocsPage />} />
              <Route path="/team-building-games" element={<TeamBuildingGames />} />
              <Route path="/corporate-team-offsite" element={<CorporateTeamOffsite />} />
              <Route path="/team-engagement-activities" element={<TeamEngagementActivities />} />
              <Route path="/corporate-team-outbound-training" element={<CorporateTeamOutboundTraining />} />
              <Route path="/return-to-office-2022-welcome-your-employees-back-to-office-with-an-amazing-fun-experience" element={<ReturnToOffice />} />
              <Route path="/team-building-activities-in-bangalore" element={<TeamBuildingActivitiesBangalore />} />
              <Route path="/one-day-outing-in-bangalore" element={<OneDayOutingBangalore />} />
              <Route path="/high-engagement-team-building-activities" element={<HighEngagementTeamBuilding />} />
              <Route path="/corporate-team-building-games" element={<CorporateTeamBuildingGames />} />
              <Route path="/corporate-team-building-activities-in-hyderabad" element={<CorporateTeamBuildingActivitiesHyderabad />} />
              <Route path="/exciting-outdoor-team-building-activities" element={<OutdoorTeamBuildingActivities />} />
              <Route path="/corporate-team-building-activities" element={<CorporateTeamBuildingActivities />} />
              <Route path="/team-outing-places-in-hyderabad" element={<TeamOutingPlacesHyderabad />} />
              <Route path="/team-outing-places-in-bangalore" element={<TeamOutingPlacesBangalore />} />
              <Route path="/team-outing-resorts-in-bangalore" element={<TeamOutingPlacesBangalore />} />
              <Route path="/plan-your-team-offsite-today" element={<PlanYourTeamOffsiteToday />} />
              <Route path="/one-day-outing-resorts-in-hyderabad" element={<OneDayOutingResortsHyderabad />} />
              <Route path="/overnight-team-outing-near-bangalore" element={<OvernightTeamOutingNearBangalore />} />
              <Route path="/corporate-team-outing-places-in-hyderabad" element={<CorporateTeamOutingPlacesHyderabad />} />
              <Route path="/corporate-team-outing-places-in-bangalore" element={<CorporateTeamOutingPlacesBangalore />} />
              <Route path="/fun-indoor-team-building-activities" element={<FunIndoorTeamBuildingActivities />} />
              <Route path="/resorts-around-bangalore" element={<ResortsAroundBangalore />} />
              <Route path="/fun-virtual-team-building-games" element={<FunVirtualTeamBuildingGames />} />
              <Route path="/online-team-building-activities-for-digital-workspaces" element={<OnlineTeamBuildingActivities />} />
              <Route path="/virtual-escape-room-teambuilding-activity-trebound" element={<VirtualEscapeRoomTeambuildingActivityTrebound />} />
              <Route path="/icebreaker-games" element={<IcebreakerGamesPage />} />
              <Route path="/team-building-activities-for-small-groups" element={<TeamBuildingActivitiesSmallGroups />} />
              <Route path="/team-collaboration-games" element={<TeamCollaborationGamesPage />} />
              <Route path="/virtual-team-building-icebreaker-games" element={<VirtualTeamBuildingIcebreakerGamesPage />} />
              <Route path="/top-team-building-activities" element={<TopTeamBuildingActivitiesPage />} />
              <Route path="/top-team-building-activities-for-large-groups" element={<TopTeamBuildingActivitiesLargeGroups />} />
            </Routes>
          </Router>
        </CombinedProvider>
      </HelmetProvider>
    </CacheProvider>
  </StrictMode>
);

createRoot(document.getElementById('root')!).render(<Root />);
