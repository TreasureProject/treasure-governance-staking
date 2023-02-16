/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  presets: [require('@treasure-project/tailwind-config')],
  theme: {
    extend: {},
  },
  plugins: [],
};
