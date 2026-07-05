/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Cabinet Grotesk"', "system-ui", "sans-serif"],
      },
      colors: {
        dark: "#1d1d1d",
        primary: "#7575c8",
        purple: "#e3e3ff",
        green: "#f3ffe3",
        pink: "#fde4f9",
        blue: "#e3f2ff",
        yellow: "#ffe49f",
        orange: "#ffefec",
        coral: "#ff6f58",
      },
    },
  },
  plugins: [],
};
