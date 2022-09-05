/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  mode: "jit",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui"] },
      animation: {
        "fade-in": "fadein 0.5s ease-in-out",
        "fade-out": "fadeout 0.5s ease-in-out",
      },
      keyframes: {
        fadein: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeout: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
