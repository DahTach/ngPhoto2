/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/app/components/**/*.{html,ts,scss,md}',
    './src/app/pages/**/*.{html,ts,scss,md}',
    './src/app/*.html'
  ],
  theme: {
    extend: {
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
  // Disable Preflight
  corePlugins: {
    preflight: false,
  },
};
