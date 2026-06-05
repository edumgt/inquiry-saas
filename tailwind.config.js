/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        g: {
          blue: '#0b57d0',
          'blue-hover': '#0842a0',
          'blue-light': '#c2e7ff',
          'blue-container': '#e8f0fe',
          surface: '#f0f4f9',
          'surface-hover': '#e8eaed',
          outline: '#e0e0e0',
          'on-surface': '#1f1f1f',
          secondary: '#444746',
          muted: '#747775',
          sidebar: '#f0f4f9',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Noto Sans KR', 'sans-serif'],
        display: ['Roboto', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
