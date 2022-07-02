/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./lib/components/**/*.{js,ts,jsx,tsx}",
    "./lib/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D6220E",
        warning: "#D78220",
        coal: "#36393B",
        salt: "#f9fafb",
        slate: "#3f3f46",
      },
    },
  },
  plugins: [],
};
