# PostHog integration report

Client-side PostHog only — no `posthog-node` (Workers isolates would drop batched server events).

## Setup

| Item | Detail |
|---|---|
| Init | `src/components/posthog.astro` in `Base.astro` (`is:inline` snippet) |
| Proxy | Same-origin `/ingest/*` → `src/worker.ts` + `src/lib/posthog-proxy.ts` |
| Dev proxy | Vite rewrites `/ingest` in `astro.config.mjs` |
| Env | `PUBLIC_POSTHOG_PROJECT_TOKEN`, `PUBLIC_POSTHOG_HOST=/ingest` — see `.env.example` |
| Secrets | `.env` is gitignored; only `phc_` project token (safe in client JS). No personal API key. |

## Events

| Event | File | Notes |
|---|---|---|
| `see_my_work_clicked` | `Hero.astro` | `click` listener on existing CTA |
| `services_learn_more_clicked` | `Services.astro` | `click` on Learn More |
| `portfolio_case_study_clicked` | `Portfolio.astro` | `data-slug` / `data-title` on links |
| `related_case_study_clicked` | `ProjectRelated.astro` | same pattern |
| `contact_form_submitted` | `ContactForm.astro` | client-side on submit (no PII; `has_company` only) |

`case_study_viewed` was removed — filter `$pageview` where `$pathname` starts with `/project/`.

## Verify after deploy

1. Open deploy preview → DevTools Network → click around → requests go to `/ingest/*` (not `us.i.posthog.com`).
2. PostHog toolbar → Live events → confirm `$pageview` and custom events.
3. Confirm `.env` never committed (`git log -- .env` should be empty).

## Dashboard

- [Analytics basics (wizard)](https://us.posthog.com/project/498941/dashboard/1801925)

Update funnel insight step 3 from `case_study_viewed` to `$pageview` filtered on `/project/`.
