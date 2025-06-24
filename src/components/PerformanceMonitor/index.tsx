import { useEffect } from 'react';

// Type declarations for gtag and performance APIs
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface PerformanceMetrics {
  lcp?: number;
  fcp?: number;
  cls?: number;
  fid?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    const shouldMonitor = import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    if (!shouldMonitor) {
      return;
    }

    let metrics: PerformanceMetrics = {};

    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
          
          console.log('🎯 LCP:', Math.round(lastEntry.startTime), 'ms');
          
          // Send to analytics if needed
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              metric_name: 'LCP',
              metric_value: Math.round(lastEntry.startTime),
              metric_id: 'lcp'
            });
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observation not supported:', error);
      }
    };

    // First Contentful Paint (FCP)
    const observeFCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
              console.log('🚀 FCP:', Math.round(entry.startTime), 'ms');
              
              if (window.gtag) {
                window.gtag('event', 'web_vitals', {
                  metric_name: 'FCP',
                  metric_value: Math.round(entry.startTime),
                  metric_id: 'fcp'
                });
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('FCP observation not supported:', error);
      }
    };

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as LayoutShiftEntry;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
          
          metrics.cls = clsValue;
          console.log('📏 CLS:', Math.round(clsValue * 1000) / 1000);
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              metric_name: 'CLS',
              metric_value: Math.round(clsValue * 1000) / 1000,
              metric_id: 'cls'
            });
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observation not supported:', error);
      }
    };

    // First Input Delay (FID)
    const observeFID = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as FirstInputEntry;
            metrics.fid = fidEntry.processingStart - entry.startTime;
            console.log('⚡ FID:', Math.round(metrics.fid), 'ms');
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                metric_name: 'FID',
                metric_value: Math.round(metrics.fid),
                metric_id: 'fid'
              });
            }
          }
        });
        
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observation not supported:', error);
      }
    };

    // Initialize observers
    observeLCP();
    observeFCP();
    observeCLS();
    observeFID();

    // Log basic timing metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.fetchStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          const loadComplete = navigation.loadEventEnd - navigation.fetchStart;
          
          console.log('📊 Performance Metrics:');
          console.log('   TTFB:', Math.round(ttfb), 'ms');
          console.log('   DOM Content Loaded:', Math.round(domContentLoaded), 'ms');
          console.log('   Load Complete:', Math.round(loadComplete), 'ms');
          
          // Send basic metrics to analytics
          if (window.gtag) {
            window.gtag('event', 'timing_complete', {
              ttfb: Math.round(ttfb),
              dom_content_loaded: Math.round(domContentLoaded),
              load_complete: Math.round(loadComplete)
            });
          }
        }
      }, 0);
    });

    // Cleanup function
    return () => {
      // PerformanceObserver cleanup is handled automatically
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor; 