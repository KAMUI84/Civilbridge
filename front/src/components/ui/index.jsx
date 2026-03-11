import React from 'react';
import { getColor, getSpacing, getRadius, getShadow, getTransition } from '../../styles/tokens';

// Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing(2),
    fontWeight: '600',
    fontFamily: 'inherit',
    fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
    padding: size === 'sm' ? `${getSpacing(2)} ${getSpacing(3)}` : 
             size === 'lg' ? `${getSpacing(4)} ${getSpacing(6)}` : 
             `${getSpacing(3)} ${getSpacing(4)}`,
    borderRadius: getRadius('xl'),
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all ${getTransition('base')}`,
    position: 'relative',
    textDecoration: 'none',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: getColor('brand.600'),
      color: getColor('semantic.textInverse'),
      boxShadow: getShadow('sm'),
    },
    secondary: {
      backgroundColor: getColor('neutral.100'),
      color: getColor('semantic.textPrimary'),
      border: `1px solid ${getColor('semantic.border')}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: getColor('semantic.textPrimary'),
    },
    danger: {
      backgroundColor: getColor('semantic.error'),
      color: getColor('semantic.textInverse'),
    },
  };

  const hoverStyles = {
    primary: {
      backgroundColor: getColor('brand.700'),
      transform: 'translateY(-1px)',
      boxShadow: getShadow('md'),
    },
    secondary: {
      backgroundColor: getColor('neutral.200'),
      borderColor: getColor('semantic.borderSecondary'),
    },
    ghost: {
      backgroundColor: getColor('semantic.backgroundSecondary'),
    },
    danger: {
      backgroundColor: '#b91c1c',
      transform: 'translateY(-1px)',
      boxShadow: getShadow('md'),
    },
  };

  const disabledStyles = {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  };

  const styles = {
    ...baseStyles,
    ...variants[variant],
    ...(disabled ? disabledStyles : {}),
    ...(className ? { className } : {}),
  };

  const IconWrapper = ({ children: iconChildren }) => (
    <span style={{ 
      display: 'flex', 
      alignItems: 'center',
      fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem'
    }}>
      {iconChildren}
    </span>
  );

  return (
    <button
      type={type}
      style={styles}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.entries(hoverStyles[variant]).forEach(([key, value]) => {
            e.target.style[key] = value;
          });
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.entries(variants[variant]).forEach(([key, value]) => {
            e.target.style[key] = value;
          });
          e.target.style.transform = 'none';
        }
      }}
      {...props}
    >
      {loading && (
        <div style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid transparent',
          borderTop: `2px solid ${getColor('semantic.textInverse')}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      )}
      {icon && iconPosition === 'left' && !loading && <IconWrapper>{icon}</IconWrapper>}
      {children}
      {icon && iconPosition === 'right' && !loading && <IconWrapper>{icon}</IconWrapper>}
    </button>
  );
};

// Card Component
export const Card = ({
  children,
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  className = '',
  ...props
}) => {
  const paddingSizes = {
    sm: getSpacing(4),
    md: getSpacing(6),
    lg: getSpacing(8),
    xl: getSpacing(10),
  };

  const styles = {
    backgroundColor: getColor('semantic.background'),
    borderRadius: getRadius('2xl'),
    boxShadow: getShadow(shadow),
    border: border ? `1px solid ${getColor('semantic.border')}` : 'none',
    padding: paddingSizes[padding] || paddingSizes.md,
    transition: hover ? `all ${getTransition('base')}` : 'none',
    ...(hover && {
      cursor: 'pointer',
    }),
    ...(className ? { className } : {}),
  };

  return (
    <div
      style={styles}
      onMouseEnter={hover ? (e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = getShadow('md');
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.target.style.transform = 'none';
        e.target.style.boxShadow = getShadow(shadow);
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

// Input Component
export const Input = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputStyles = {
    width: '100%',
    padding: `${getSpacing(3)} ${getSpacing(4)}`,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    borderRadius: getRadius('lg'),
    border: `1px solid ${error ? getColor('semantic.error') : getColor('semantic.border')}`,
    backgroundColor: getColor('semantic.background'),
    color: getColor('semantic.textPrimary'),
    transition: `all ${getTransition('fast')}`,
    outline: 'none',
    ...(disabled ? {
      opacity: 0.6,
      cursor: 'not-allowed',
    } : {}),
    ...(className ? { className } : {}),
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: getColor('semantic.textPrimary'),
    marginBottom: getSpacing(2),
  };

  const errorStyles = {
    color: getColor('semantic.error'),
    fontSize: '0.75rem',
    marginTop: getSpacing(1),
  };

  const helperStyles = {
    color: getColor('semantic.textTertiary'),
    fontSize: '0.75rem',
    marginTop: getSpacing(1),
  };

  return (
    <div style={{ marginBottom: getSpacing(4) }}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: getColor('semantic.error') }}> *</span>}
        </label>
      )}
      <input
        style={inputStyles}
        disabled={disabled}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = getColor('brand.500');
            e.target.style.boxShadow = `0 0 0 3px ${getColor('brand.100')}`;
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? getColor('semantic.error') : getColor('semantic.border');
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <div style={errorStyles}>{error}</div>}
      {helperText && !error && <div style={helperStyles}>{helperText}</div>}
    </div>
  );
};

// Badge Component
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '500',
    fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
    padding: size === 'sm' ? `${getSpacing(1)} ${getSpacing(2)}` : `${getSpacing(2)} ${getSpacing(3)}`,
    borderRadius: getRadius('full'),
    ...(className ? { className } : {}),
  };

  const variants = {
    default: {
      backgroundColor: getColor('neutral.100'),
      color: getColor('semantic.textPrimary'),
    },
    success: {
      backgroundColor: getColor('semantic.successBackground'),
      color: getColor('semantic.success'),
    },
    warning: {
      backgroundColor: getColor('semantic.warningBackground'),
      color: getColor('semantic.warning'),
    },
    error: {
      backgroundColor: getColor('semantic.errorBackground'),
      color: getColor('semantic.error'),
    },
    info: {
      backgroundColor: getColor('semantic.infoBackground'),
      color: getColor('semantic.info'),
    },
    brand: {
      backgroundColor: getColor('brand.100'),
      color: getColor('brand.700'),
    },
  };

  return (
    <span
      style={{
        ...baseStyles,
        ...variants[variant],
      }}
      {...props}
    >
      {children}
    </span>
  );
};

// Modal Component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
  ...props
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: getSpacing(4),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: getColor('semantic.background'),
          borderRadius: getRadius('2xl'),
          boxShadow: getShadow('2xl'),
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'scaleIn 0.2s ease-out',
        }}
        className={sizes[size]}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${getSpacing(6)} ${getSpacing(6)} ${getSpacing(4)}`,
              borderBottom: `1px solid ${getColor('semantic.border')}`,
            }}
          >
            {title && (
              <h2 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: getColor('semantic.textPrimary'),
              }}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: getColor('semantic.textTertiary'),
                  cursor: 'pointer',
                  padding: getSpacing(2),
                  borderRadius: getRadius('md'),
                  transition: `all ${getTransition('fast')}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = getColor('semantic.backgroundSecondary');
                  e.target.style.color = getColor('semantic.textPrimary');
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = getColor('semantic.textTertiary');
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div style={{ padding: getSpacing(6) }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Spinner Component
export const Spinner = ({ size = 'md', color = 'brand' }) => {
  const sizes = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  };

  const colors = {
    brand: getColor('brand.600'),
    neutral: getColor('semantic.textTertiary'),
    white: getColor('semantic.textInverse'),
  };

  return (
    <div
      style={{
        width: sizes[size],
        height: sizes[size],
        border: '2px solid transparent',
        borderTop: `2px solid ${colors[color]}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

// Toast Component
export const Toast = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  className = '',
  ...props
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: {
      backgroundColor: getColor('semantic.successBackground'),
      color: getColor('semantic.success'),
      borderLeft: `4px solid ${getColor('semantic.success')}`,
    },
    error: {
      backgroundColor: getColor('semantic.errorBackground'),
      color: getColor('semantic.error'),
      borderLeft: `4px solid ${getColor('semantic.error')}`,
    },
    warning: {
      backgroundColor: getColor('semantic.warningBackground'),
      color: getColor('semantic.warning'),
      borderLeft: `4px solid ${getColor('semantic.warning')}`,
    },
    info: {
      backgroundColor: getColor('semantic.infoBackground'),
      color: getColor('semantic.info'),
      borderLeft: `4px solid ${getColor('semantic.info')}`,
    },
  };

  return (
    <div
      style={{
        ...types[type],
        padding: `${getSpacing(3)} ${getSpacing(4)}`,
        borderRadius: getRadius('lg'),
        boxShadow: getShadow('md'),
        display: 'flex',
        alignItems: 'center',
        gap: getSpacing(3),
        minWidth: '300px',
        animation: 'slideRight 0.3s ease-out',
        ...(className ? { className } : {}),
      }}
      {...props}
    >
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.25rem',
          cursor: 'pointer',
          opacity: 0.7,
          padding: getSpacing(1),
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};

// Container Component
export const Container = ({ children, size = 'lg', className = '', ...props }) => {
  const sizes = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: sizes[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: getSpacing(4),
        paddingRight: getSpacing(4),
        ...(className ? { className } : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default {
  Button,
  Card,
  Input,
  Badge,
  Modal,
  Spinner,
  Toast,
  Container,
};
