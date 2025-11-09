/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ИЩЕМ .tsx ФАЙЛЫ (ИСПРАВЛЕНО)
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
