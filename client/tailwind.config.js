/** @type {import('tailwindcss').Config} */
export default {
  // tells tailwind which files to scan for class names
  // so it only includes CSS for classes you actually use
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // custom colours matching our LaTeX theme
      colors: {
        cyan: {
          500: '#e11d48',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
