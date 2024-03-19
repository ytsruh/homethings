/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D6220E',
        warning: '#D78220',
        coal: '#36393B',
        salt: '#f9fafb',
        slate: '#3f3f46',
      },
    },
  },
  plugins: [],
};
