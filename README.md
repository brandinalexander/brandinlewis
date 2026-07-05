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

## Cloudflare Pages / Workers

Static-first Astro with the Cloudflare adapter. Pages prerender to HTML; future API routes (contact form) opt out with `export const prerender = false`.

| Setting | Value |
|---------|-------|
| Root directory | `/` (repo root) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Node version | 20+ |

Local preview against the Worker:

```bash
npm run preview
```

Deploy manually:

```bash
npm run deploy
```

Generate Wrangler types after changing `wrangler.jsonc`:

```bash
npm run cf-typegen
```

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
