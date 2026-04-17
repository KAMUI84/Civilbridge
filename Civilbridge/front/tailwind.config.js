/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        skeleton: 'var(--skeleton)',
        border: 'var(--btn-border)',
        input: 'var(--input)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        input: [
          '0px 2px 3px -1px rgba(0, 0, 0, 0.1)',
          '0px 1px 0px 0px rgba(25, 28, 33, 0.02)',
          '0px 0px 0px 1px rgba(25, 28, 33, 0.08)',
        ].join(', '),
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        ripple: 'ripple 2s ease calc(var(--i, 0) * 0.2s) infinite',
        orbit: 'orbit calc(var(--duration) * 1s) linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        ripple: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(0.9)' },
        },
        orbit: {
          '0%': {
            transform:
              'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)',
          },
          '100%': {
            transform:
              'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)',
          },
        },
      },
    },
  },
  safelist: [
    // Gradient headers used across redesigned pages
    { pattern: /^bg-gradient-to-(r|br|b|tr)$/ },
    { pattern: /^from-(emerald|teal|blue|indigo|slate|gray)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^to-(emerald|teal|blue|indigo|slate|gray)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^via-(emerald|teal|blue|indigo|slate|gray)-(50|100|200|300|400|500|600|700|800|900)$/ },
    // Background colors used in redesigned pages
    { pattern: /^bg-(emerald|teal|blue|indigo|slate|gray|white|red|yellow|purple)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^text-(emerald|teal|blue|indigo|slate|gray|white|red|yellow|purple)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^border-(emerald|teal|blue|indigo|slate|gray|white)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^ring-(emerald|blue|indigo)-(50|100|200|300|400|500|600|700|800|900)$/ },
    // bg-white, bg-gray-50, text-white
    'bg-white', 'text-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-900',
    // Opacity bg utilities
    'bg-white/10', 'bg-white/20', 'bg-white/30', 'bg-black/50',
    // Clip text gradient
    'bg-clip-text', 'text-transparent',
  ],
  plugins: [],
};
