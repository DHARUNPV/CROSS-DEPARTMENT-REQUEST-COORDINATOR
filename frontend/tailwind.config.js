/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gov: {
          navy: '#0f172a',
          slate: '#1e293b',
          blue: '#2563eb',
          teal: '#0d9488',
          amber: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
};
