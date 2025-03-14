import plugin from 'tailwindcss/plugin';

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', // For Next.js 13+ App Router
    './pages/**/*.{js,jsx,ts,tsx}', // For Pages Router
    './components/**/*.{js,jsx,ts,tsx}',], // Update with your content paths
  theme: {
    extend: {},
  },
  plugins: [
    plugin('tailwindcss-animate'), // Ensure this line is included
  ],
};