import containerQueries from '@tailwindcss/container-queries'

export default {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    screens: {
      // phone-first
      sm: '360px',
      md: '768px',   // tablet portrait
      lg: '1024px',  // tablet landscape / small laptop
      xl: '1280px',  // desktop
      '2xl': '1536px'
    },
    extend: {
      spacing: { 'safe': 'env(safe-area-inset-bottom)' },
      fontSize: {
        // fluid type examples
        'display': ['clamp(28px, 4vw, 56px)', { lineHeight: '1.1' }],
        'title': ['clamp(20px, 2.5vw, 32px)', { lineHeight: '1.15' }],
      }
    }
  },
  plugins: [containerQueries],
}
