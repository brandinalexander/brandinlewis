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
        // Canonical palette — values traced from Assets/pages/*.html elements, not bulk CSS harvest.
        // Do not use raw hex in components; reference these tokens only.
        ink: "#1d1d1d", // body text, borders (--dark on .body)
        paper: "#ffffff", // default section bg (.background-white, services wrapper)
        vermillion: "#ff6f58", // hero .button-edge, badge default, Nexamp header inline style
        "un-blue": {
          hope: "#4983ef", // HOPE case study header inline hsla(219, 84.42%, 61.48%)
          unpp: "#6ccbff", // UNPP case study header inline hsla(201, 100%, 71.21%)
        },
        muted: "#60697b", // secondary UI text (mobile nav .w--open)
        theme: {
          hope: "#4983ef",
          unpp: "#6ccbff",
          vermillion: "#ff6f54",
          regional: "#e3f2ff",
        },
      },
    },
  },
  plugins: [],
};
