/** @type {import('tailwindcss').Config} */
//
// FluentLanguage.net — Design System tokens.
// See DESIGN_SYSTEM.md for the rationale behind every value below.
// Aesthetic: "editorial luxury" — warm alabaster light, deep espresso ink,
// a confident terracotta→saffron accent and a jewel viridian secondary.
// Premium and dramatic, but built to earn the trust of legal/medical buyers.
//
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces — warm, not clinical
        alabaster: '#FAF6F0', // primary light background
        linen: '#F2EAE0', // alternating section background
        ink: {
          DEFAULT: '#17120D', // near-black espresso (dark sections / text)
          800: '#241C14',
          700: '#332720',
        },
        // Primary accent — terracotta / copper (the brand's heart)
        terracotta: {
          50: '#FBF1EB',
          100: '#F5DDD0',
          200: '#E9B89F',
          300: '#DB9070',
          400: '#CE6F49',
          500: '#C2613D', // brand primary
          600: '#A34C2D',
          700: '#7E3A22',
        },
        // Warm gold — for highlights, stars, gradient blends
        saffron: {
          400: '#E8A23D',
          500: '#D98A23',
        },
        // Jewel secondary — deep viridian (replaces the flat sage)
        viridian: {
          400: '#2E8A76',
          500: '#1F6E5E',
          600: '#175548',
        },
        // Functional
        success: '#10B981',
        warning: '#F59E0B',
        error: '#E5484D',
      },
      fontFamily: {
        // Expressive high-contrast serif for display headings
        display: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        // Hyper-legible geometric sans for body + UI
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Fluid display scale (clamp-based) for the kinetic hero
        'display-sm': ['clamp(2.25rem, 4vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.0', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(3.25rem, 8vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        // Elevated, warm-tinted shadows (never pure black)
        soft: '0 2px 12px -2px rgba(35, 24, 16, 0.08)',
        elevated: '0 12px 40px -8px rgba(35, 24, 16, 0.16)',
        float: '0 24px 60px -12px rgba(35, 24, 16, 0.22)',
        glow: '0 0 0 1px rgba(194, 97, 61, 0.25), 0 18px 50px -12px rgba(194, 97, 61, 0.35)',
        // Inset hairline for glass surfaces
        'inner-hairline': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.55)',
      },
      backgroundImage: {
        // Multi-layered mesh gradient (used on hero + CTA)
        'mesh-warm':
          'radial-gradient(at 18% 20%, rgba(194, 97, 61, 0.28) 0px, transparent 55%),' +
          'radial-gradient(at 82% 12%, rgba(232, 162, 61, 0.22) 0px, transparent 50%),' +
          'radial-gradient(at 75% 82%, rgba(31, 110, 94, 0.20) 0px, transparent 55%),' +
          'radial-gradient(at 10% 88%, rgba(219, 144, 112, 0.18) 0px, transparent 50%)',
        'mesh-ink':
          'radial-gradient(at 15% 15%, rgba(194, 97, 61, 0.35) 0px, transparent 50%),' +
          'radial-gradient(at 85% 25%, rgba(232, 162, 61, 0.18) 0px, transparent 45%),' +
          'radial-gradient(at 60% 90%, rgba(46, 138, 118, 0.22) 0px, transparent 50%)',
        'gradient-accent': 'linear-gradient(120deg, #C2613D 0%, #D98A23 100%)',
        'grain-fade': 'linear-gradient(180deg, transparent 0%, rgba(23,18,13,0.04) 100%)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        // Slow drift for mesh-gradient blobs
        'mesh-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(3%, -4%, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-3%, 2%, 0) scale(0.96)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'mesh-drift': 'mesh-drift 18s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 40s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      // Extra opacity steps used by hairlines / muted text in the design system.
      opacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
        35: '0.35',
        55: '0.55',
        65: '0.65',
      },
    },
  },
  plugins: [],
}
