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

## Content

- Blog posts: MDX files in `src/content/articles/`
- Projects: Markdown (.md), not MDX
- Art: yaml listing file
- Frontmatter for metadata, tags in blog

