# Agent Guidelines

Static-first personal site built with Astro + MDX. Deploys to Cloudflare worker assets.

## Hard Constraints

- **No SPA, no React/Vue/Svelte, no Tailwind/Bootstrap**
- Vanilla TypeScript only for interactivity — no framework hydration
- Pure CSS with variables, CUBE CSS style — no utility frameworks
- Static build only — no server-side features unless requested
- JS must not block rendering — use `client:idle` or `client:visible`
- Accessible semantic HTML, mobile-first responsive
- Dark/light/auto theme support

## Code Conventions

- Interactive islands: vanilla TS, progressive enhancement, load after content
- CSS: use variables for spacing/colors, serif-focused typography, avoid inline styles
- Do not mix layout and visual concerns or couple layout to components
- WebGL background: isolated in `/src/visuals`, no layout coupling, fail gracefully

## Design Tokens

All tokens live in `src/styles/theme.css`, in two layers:

- **Palette** (what a color is): hue + modifier, e.g. `--navy`, `--navy-raised`, `--blue-soft`, `--gold-deep`. No numeric scales (`blue-500`).
- **Roles** (what a color does): `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-link`, `--color-link-visited`, `--color-focus`, `--color-accent` (rose), `--color-emphasis` (gold), `--color-highlight`.

Rules:

- Components and pages use role tokens only, never palette tokens or raw hex. Exception: decorative visuals (WebGL background, 404 glitch) may use palette tokens directly.
- Light theme (`[data-theme="light"]`) only remaps roles to other palette entries; it never redefines palette values.
- Add a new role only when a real usage needs one; reuse existing roles otherwise.
- On cream, `--color-link`, `--color-accent` and `--color-emphasis` are ~3:1. Fine for underlines, large or bold text and decoration; not for small body text.
- Spacing: modular scale `--s-5` … `--s5` (ratio 1.4). Fonts: `--font-display` (Smooch Sans), `--font-body` (Baskervville), `--font-mono` (Anonymous Pro).

## Content

- Blog posts: MDX files in `src/content/articles/`
- Projects: Markdown (.md), not MDX
- Art: yaml listing file
- Frontmatter for metadata, tags in blog

