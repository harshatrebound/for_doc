import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const POPUP_DELAY = 15000; // 15 seconds
const POPUP_SHOWN_KEY = 'skipSearchPopupShown';
const POPUP_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Pages where skip search popup should NOT appear
const EXCLUDED_PATHS = [
  '/', // Homepage
  '/blog', // Blog listing
  '/contact', // Contact Us
  '/about', // About Us
  '/jobs', // Careers/Jobs
  '/thank-you', // Thank you page
];

const EXCLUDED_PATH_PATTERNS = [
  /^\/blog\//, // Individual blog posts
];

export const useSkipSearchPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if current path should be excluded
    const currentPath = location.pathname;
    const isExcluded = EXCLUDED_PATHS.includes(currentPath) || 
      EXCLUDED_PATH_PATTERNS.some(pattern => pattern.test(currentPath));

    if (isExcluded) {
      return;
    }

    const lastShownTime = localStorage.getItem(POPUP_SHOWN_KEY);
    const currentTime = new Date().getTime();

    // Check if popup was shown in the last 24 hours
    if (lastShownTime && currentTime - parseInt(lastShownTime) < POPUP_EXPIRY) {
      return;
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      localStorage.setItem(POPUP_SHOWN_KEY, currentTime.toString());
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const closePopup = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    closePopup,
  };
};

export default useSkipSearchPopup; 