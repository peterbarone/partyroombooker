import containerQueries from '@tailwindcss/container-queries'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',         // add
    './components/**/*.{ts,tsx}',  // add
    './pages/**/*.{ts,tsx}',       // add if you have /pages
  ],
  theme: {
    screens: {
      sm: '360px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      spacing: { 'safe': 'env(safe-area-inset-bottom)' },
      fontSize: {
        'display': ['clamp(28px, 4vw, 56px)', { lineHeight: '1.1' }],
        'title': ['clamp(20px, 2.5vw, 32px)', { lineHeight: '1.15' }],
      },
      colors: {
        wiz: {
          purple: {
            50: 'var(--wizzy-purple-50)',
            100: 'var(--wizzy-purple-100)',
            200: 'var(--wizzy-purple-200)',
            300: 'var(--wizzy-purple-300)',
            400: 'var(--wizzy-purple-400)',
            500: 'var(--wizzy-purple-500)',
            600: 'var(--wizzy-purple-600)',
            700: 'var(--wizzy-purple-700)'
          },
          portal: {
            50: 'var(--portal-50)',
            200: 'var(--portal-200)',
            400: 'var(--portal-400)',
            500: 'var(--portal-500)'
          },
          parchment: {
            50: 'var(--parchment-50)',
            100: 'var(--parchment-100)',
            200: 'var(--parchment-200)'
          },
          ink: {
            500: 'var(--ink-500)',
            600: 'var(--ink-600)',
            700: 'var(--ink-700)'
          },
          wood: {
            600: 'var(--wood-600)',
            700: 'var(--wood-700)'
          }
        }
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px'
      },
      boxShadow: {
        parchment: '0 2px 8px rgba(0,0,0,.12)',
        lift: '0 4px 14px rgba(0,0,0,.16)',
        glow: '0 0 0 3px rgba(118,199,255,.35)',
        portal: '0 0 22px rgba(79,174,242,.35)'
      }
    }
  },

  /* OPTIONAL but recommended */
  safelist: [
    'bg-parchment',
    'bg-parchment-texture',
    'shadow-parchment',
    'shadow-portal',
    'ring-wiz-portal-200',
    'border-wiz-purple-400',
  ],

  plugins: [containerQueries],
}
