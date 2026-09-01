/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Sora"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace']
      },
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#EBE5D8',
          300: '#DDD5C3',
          400: '#C7BC9F',
          500: '#AD9E7C',
        },
        gold: {
          50: '#FBF8F1',
          100: '#F6EEDC',
          200: '#EDDAB9',
          300: '#DFC28F',
          400: '#D2AB66',
          500: '#C59A3F',
          600: '#AA7F2E',
          700: '#876223',
          800: '#684B1E',
          900: '#4D3617',
        },
        nila: {
          50: '#F2F4F7',
          100: '#E2E6EC',
          200: '#C7CDD8',
          500: '#4F5874',
          700: '#2E354B',
          800: '#212638',
          900: '#171B29',
        }
      }
    },
  },
  plugins: [],
}
