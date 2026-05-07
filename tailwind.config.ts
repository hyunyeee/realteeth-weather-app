module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
      },
      colors: {
        "page-green": "var(--color-page-green)",
        "light-green-main": "var(--color-light-green)",
        "primary-green": "var(--color-primary-green)",
        "dark-green": "var(--color-dark-green)",
      },
    },
  },
  darkMode: "media", // class
  plugins: ["tailwindcss-animate"],
};
