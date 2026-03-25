// Mobile Responsiveness Enhancement
import React, { useState, useEffect } from 'react';

// Mobile detection utility
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    width: 0,
    height: 0,
    orientation: 'portrait'
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
      setDeviceInfo({
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet, deviceInfo };
};

// Responsive breakpoints
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px'
};

// Responsive styles generator
export const responsive = (styles) => {
  return {
    ...styles,
    '@media (max-width: 768px)': {
      ...styles.mobile
    },
    '@media (min-width: 769px) and (max-width: 1024px)': {
      ...styles.tablet
    },
    '@media (min-width: 1025px)': {
      ...styles.desktop
    }
  };
};

// Mobile-optimized component wrapper
export const MobileOptimized = ({ children, mobileStyle, tabletStyle, desktopStyle, ...props }) => {
  const { isMobile, isTablet } = useMobileDetection();

  const getResponsiveStyle = () => {
    if (isMobile) return mobileStyle;
    if (isTablet) return tabletStyle;
    return desktopStyle;
  };

  return (
    <div style={{ ...props.style, ...getResponsiveStyle() }}>
      {children}
    </div>
  );
};

// Touch gesture utilities
export const useTouchGestures = (elementRef, callbacks = {}) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
        } else if (deltaX < 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown();
        } else if (deltaY < 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp();
        }
      }
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, callbacks]);

  return { touchStart, touchEnd };
};

// Mobile navigation component
export const MobileNavigation = ({ isOpen, onClose, items }) => {
  const { isMobile } = useMobileDetection();

  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: isOpen ? 'block' : 'none'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        padding: '20px'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px'
      }}>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              padding: '15px 20px',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Responsive grid system
export const ResponsiveGrid = ({ children, columns = { mobile: 1, tablet: 2, desktop: 3 }, gap = 16 }) => {
  const { isMobile, isTablet } = useMobileDetection();

  const getColumns = () => {
    if (isMobile) return columns.mobile || 1;
    if (isTablet) return columns.tablet || 2;
    return columns.desktop || 3;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
      gap: `${gap}px`
    }}>
      {children}
    </div>
  );
};

// Mobile-optimized form component
export const MobileForm = ({ children, onSubmit, ...props }) => {
  const { isMobile } = useMobileDetection();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '16px' : '20px',
        padding: isMobile ? '16px' : '24px',
        ...props.style
      }}
    >
      {children}
    </form>
  );
};

// Mobile-optimized input component
export const MobileInput = ({ type = 'text', placeholder, value, onChange, ...props }) => {
  const { isMobile } = useMobileDetection();

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: isMobile ? '12px 16px' : '16px 20px',
        fontSize: isMobile ? '16px' : '14px',
        border: '1px solid #262626',
        borderRadius: '8px',
        background: '#1a1a1a',
        color: '#f0f0f0',
        width: '100%',
        boxSizing: 'border-box',
        ...props.style
      }}
    />
  );
};

// Mobile-optimized button component
export const MobileButton = ({ children, onClick, variant = 'primary', size = 'medium', ...props }) => {
  const { isMobile } = useMobileDetection();

  const getStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 600,
      textAlign: 'center',
      width: isMobile ? '100%' : 'auto'
    };

    const sizeStyles = {
      small: {
        padding: isMobile ? '10px 16px' : '8px 16px',
        fontSize: isMobile ? '14px' : '12px'
      },
      medium: {
        padding: isMobile ? '14px 20px' : '12px 24px',
        fontSize: isMobile ? '16px' : '14px'
      },
      large: {
        padding: isMobile ? '16px 24px' : '14px 32px',
        fontSize: isMobile ? '18px' : '16px'
      }
    };

    const variantStyles = {
      primary: {
        background: 'linear-gradient(135deg, #00f2ff 0%, #6366f1 100%)',
        color: '#050505'
      },
      secondary: {
        background: 'transparent',
        border: '1px solid #262626',
        color: '#f0f0f0'
      },
      danger: {
        background: '#ef4444',
        color: '#white'
      },
      success: {
        background: '#22c55e',
        color: '#white'
      }
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...props.style
    };
  };

  return (
    <button
      onClick={onClick}
      style={getStyles()}
      {...props}
    >
      {children}
    </button>
  );
};

// Mobile-optimized card component
export const MobileCard = ({ children, title, subtitle, actions, ...props }) => {
  const { isMobile } = useMobileDetection();

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '24px',
      marginBottom: isMobile ? '16px' : '24px',
      ...props.style
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '16px' }}>
          {title && (
            <h3 style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 700,
              color: '#f0f0f0',
              margin: '0 0 8px 0'
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#64748b',
              margin: 0
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div style={{ marginBottom: actions ? '16px' : '0' }}>
        {children}
      </div>
      
      {actions && (
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {actions}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized table component
export const MobileTable = ({ data, columns, ...props }) => {
  const { isMobile } = useMobileDetection();

  if (isMobile) {
    // Mobile card-based layout
    return (
      <div style={{ ...props.style }}>
        {data.map((row, index) => (
          <MobileCard key={index} style={{ marginBottom: '12px' }}>
            {columns.map((column) => (
              <div key={column.key} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  {column.title}
                </div>
                <div style={{ fontSize: '14px', color: '#f0f0f0' }}>
                  {column.render ? column.render(row[column.key]) : row[column.key]}
                </div>
              </div>
            ))}
          </MobileCard>
        ))}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div style={{
      overflowX: 'auto',
      ...props.style
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <thead>
          <tr style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            {columns.map((column) => (
              <th key={column.key} style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: 600,
                color: '#f0f0f0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key} style={{
                  padding: '12px',
                  fontSize: '14px',
                  color: '#f0f0f0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {column.render ? column.render(row[column.key]) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Mobile viewport meta tag updater
export const updateViewportMeta = () => {
  if (typeof document !== 'undefined') {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }
};

// Initialize mobile optimizations
export const initializeMobileOptimizations = () => {
  // Update viewport meta tag
  updateViewportMeta();
  
  // Add touch-friendly CSS
  const style = document.createElement('style');
  style.textContent = `
    /* Touch-friendly tap targets */
    button, a, input, select, textarea {
      min-height: 44px;
      min-width: 44px;
    }
    
    /* Prevent zoom on input focus */
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    textarea,
    select {
      font-size: 16px !important;
    }
    
    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
    
    /* Hide scrollbars on mobile */
    ::-webkit-scrollbar {
      display: none;
    }
    
    /* Better button spacing on mobile */
    @media (max-width: 768px) {
      .button-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
    }
  `;
  document.head.appendChild(style);
};

export default {
  useMobileDetection,
  breakpoints,
  responsive,
  MobileOptimized,
  useTouchGestures,
  MobileNavigation,
  ResponsiveGrid,
  MobileForm,
  MobileInput,
  MobileButton,
  MobileCard,
  MobileTable,
  updateViewportMeta,
  initializeMobileOptimizations
};
