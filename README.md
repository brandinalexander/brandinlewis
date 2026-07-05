# brandinlewis

Personal portfolio site — Astro + Tailwind + Alpine.js, deployed on Cloudflare Pages.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Cloudflare Pages

| Setting | Value |
|---------|-------|
| Root directory | `/` (repo root) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20+ |

## Structure

```
src/
  layouts/       Base.astro
  components/    Header, Footer, ContactForm
  pages/         index.astro, project/[slug].astro
  content/project/   Case study markdown files
public/          Static assets (images, fonts)
```

Reference material (harvested Webflow assets, HTML, screenshots) lives in `../Assets/` outside this repo.
