/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#f7f8fc',
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
        },
        accent: '#4f46e5', // Indigo
        targetLine: '#fbbf24', // Amber
      },
    },
  },
  plugins: [],
}