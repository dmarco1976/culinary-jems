/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#FFC559',
          'gold-dark': '#E5A830',
          pink: '#F00075',
          'pink-dark': '#CC0063',
          dark: '#111111',
          light: '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
