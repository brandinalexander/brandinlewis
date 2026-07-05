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
        purple: "hsl(270 60% 88%)",
        green: "hsl(120 45% 85%)",
        pink: "hsl(330 70% 88%)",
        blue: "hsl(201 100% 71%)",
      },
    },
  },
  plugins: [],
};
