// Performance Optimization Implementation
import React, { Suspense, lazy, memo, useMemo, useCallback } from 'react';

// Lazy loading for heavy components
const Dashboard = lazy(() => import('./pages/dashboard/DashboardLayout'));
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));
const Payments = lazy(() => import('./pages/dashboard/Payments'));

// Memoized components to prevent unnecessary re-renders
const MemoizedDashboard = memo(Dashboard);
const MemoizedAnalytics = memo(Analytics);
const MemoizedPayments = memo(Payments);

// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  startTiming(name) {
    this.metrics.set(name, performance.now());
  }

  endTiming(name) {
    const start = this.metrics.get(name);
    if (start) {
      const duration = performance.now() - start;
      this.metrics.delete(name);
      this.notifyObservers({ name, duration });
      return duration;
    }
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  notifyObservers(metric) {
    this.observers.forEach(callback => callback(metric));
  }

  getAverageMetric() {
    // Implementation for calculating average metrics
    return 0;
  }
}

// Image optimization utility
export const optimizeImage = (src, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp'
  } = options;

  // Return optimized image URL
  return `${src}?w=${width}&h=${height}&q=${quality}&f=${format}`;
};

// Debounce utility for search and input optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling for large lists
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  return { visibleItems, setScrollTop };
};

// Cache utility for API responses
class APICache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance
export const apiCache = new APICache();

// Optimized API hook with caching
export const useOptimizedAPI = (url, options = {}) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cachedData = apiCache.get(url);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from API
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Cache the result
      apiCache.set(url, result);
      
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Bundle size optimization
export const preloadComponent = (componentPath) => {
  // Preload component code
  import(componentPath).catch(console.error);
};

// Service Worker registration for offline support
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  return null;
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css) => {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
};

// Resource hints for performance
export const addResourceHints = () => {
  // DNS prefetch
  const dnsPrefetch = ['api.civilbridge.com', 'cdn.civilbridge.com'];
  dnsPrefetch.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect
  const preconnect = ['https://fonts.googleapis.com'];
  preconnect.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState([]);

  React.useEffect(() => {
    const monitor = new PerformanceMonitor();
    
    monitor.addObserver((metric) => {
      setMetrics(prev => [...prev.slice(-9), metric]);
    });

    // Monitor page load
    if ('performance' in window && 'getEntriesByType' in performance) {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const loadTime = entries[0].loadEventEnd - entries[0].loadEventStart;
        monitor.notifyObservers({ name: 'pageLoad', duration: loadTime });
      }
    }

    return () => {
      // Cleanup
    };
  }, []);

  return metrics;
};

// Optimized image component with lazy loading
export const OptimizedImage = ({ src, alt, width, height, ...props }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ position: 'relative', ...props.style }}>
      {isInView && (
        <img
          src={optimizeImage(src, { width, height })}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            width: '100%',
            height: 'auto'
          }}
        />
      )}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #262626',
            borderTop: '2px solid #00f2ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
    </div>
  );
};

// Performance optimization configuration
export const performanceConfig = {
  // Enable React Strict Mode for development
  strictMode: Boolean(import.meta.env.DEV),
  
  // Component lazy loading
  lazyLoading: true,
  
  // Image optimization
  imageOptimization: {
    enabled: true,
    format: 'webp',
    quality: 80,
    lazyLoading: true
  },
  
  // API caching
  caching: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 100
  },
  
  // Bundle optimization
  bundle: {
    codeSplitting: true,
    treeShaking: true,
    minification: true
  },
  
  // Monitoring
  monitoring: {
    enabled: true,
    sampleRate: 0.1 // 10% sampling
  }
};

// Initialize performance optimizations
export const initializePerformance = () => {
  // Add resource hints
  addResourceHints();
  
  // Register service worker
  registerServiceWorker();
  
  // Monitor performance
  if (performanceConfig.monitoring.enabled) {
    // Initialize monitoring
  }
  
  // Inline critical CSS
  if (typeof document !== 'undefined') {
    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
    `;
    inlineCriticalCSS(criticalCSS);
  }
};

export default {
  PerformanceMonitor,
  optimizeImage,
  debounce,
  throttle,
  useVirtualScroll,
  APICache,
  apiCache,
  useOptimizedAPI,
  preloadComponent,
  registerServiceWorker,
  inlineCriticalCSS,
  addResourceHints,
  usePerformanceMonitoring,
  OptimizedImage,
  performanceConfig,
  initializePerformance
};
