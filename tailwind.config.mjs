import typography from "@tailwindcss/typography";

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
      typography: {
        project: {
          css: {
            "--tw-prose-body": "var(--ink)",
            "--tw-prose-headings": "var(--ink)",
            "--tw-prose-bold": "var(--ink)",
            "--tw-prose-counters": "var(--ink)",
            "--tw-prose-bullets": "var(--ink)",
            maxWidth: "none",
            color: "var(--ink)",
            fontSize: "18px",
            lineHeight: "1.7",
            p: {
              marginTop: "0",
              marginBottom: "25px",
            },
            h2: {
              fontFamily: '"Cabinet Grotesk", sans-serif',
              fontWeight: "700",
              letterSpacing: "-0.01rem",
              fontSize: "32px",
              lineHeight: "1.125",
              marginTop: "40px",
              marginBottom: "15px",
            },
            h4: {
              fontFamily: '"Cabinet Grotesk", sans-serif',
              fontWeight: "700",
              marginTop: "20px",
              marginBottom: "10px",
              fontSize: "18px",
              lineHeight: "24px",
            },
            h5: {
              fontFamily: '"Cabinet Grotesk", sans-serif',
              fontWeight: "700",
              marginTop: "10px",
              marginBottom: "10px",
              fontSize: "14px",
              lineHeight: "20px",
            },
            ul: {
              listStyleType: "disc",
              marginTop: "0",
              marginBottom: "25px",
              paddingLeft: "40px",
            },
            ol: {
              listStyleType: "decimal",
              marginTop: "0",
              marginBottom: "25px",
              paddingLeft: "40px",
            },
            li: {
              marginTop: "0",
              marginBottom: "8px",
            },
            "li p": {
              marginTop: "0",
              marginBottom: "0",
            },
            blockquote: {
              fontStyle: "normal",
              fontWeight: "400",
              borderLeftWidth: "0",
              quotes: "none",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};
