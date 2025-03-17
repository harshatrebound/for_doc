import { useState, useEffect } from 'react';

const POPUP_DELAY = 15000; // 15 seconds
const POPUP_SHOWN_KEY = 'skipSearchPopupShown';
const POPUP_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useSkipSearchPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
  }, []);

  const closePopup = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    closePopup,
  };
};

export default useSkipSearchPopup; 