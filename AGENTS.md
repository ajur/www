# Development Guidelines for AI Agents

## Project Brief

Goal: A content-first journal-style personal site with a full-screen WebGL background on the homepage, Markdown/MDX-based blog, tag system, RSS, and minimal design using modern CSS.

Core principles:
- Static-first architecture
- No SPA
- No React/Vue
- Vanilla TypeScript for interactive islands
- Pure CSS with variables
- Dark/Light/Auto theme support
- Progressive enhancement
- Clean URLs
- GitHub Pages deployment

Tech stack:
- Astro
- MDX
- Astro Content Collections
- TypeScript
- Vanilla JS islands
- Astro Image integration
- RSS enabled

Sections:
- Home (full-screen WebGL background)
- Bio
- Blog (MDX, tags)
- Projects (static descriptions linking to subdomains)
- Art (gallery + detail pages, future modal enhancement)
- Contact (social links only)

Requirements:
- Blog posts stored as single MDX files
- Tag pages auto-generated
- RSS feed auto-generated
- Theme toggle with light/dark/auto
- Canvas loads after content
- No heavy framework dependencies
- Accessible semantic HTML
- Mobile-first responsive design

Deliverables:
- Astro project scaffold
- Content collection schema
- Base layout
- Theme system
- WebGL background scaffold
- Blog system
- Tag system
- RSS
- GitHub Actions workflow

## Architecture Philosophy

This project is:
- Static-first
- Content-driven
- Minimalistic
- Framework-light

Avoid:
- Introducing React/Vue/Svelte
- Adding unnecessary runtime dependencies
- Converting the site into an SPA
- Adding Tailwind unless explicitly requested

## Interactive Components

All interactive elements must:
- Be written in vanilla TypeScript
- Avoid framework hydration
- Use progressive enhancement
- Load after main content

## Styling Rules

- If possible follow CUBE CSS style guide
- Use CSS variables
- Support dark/light/auto
- Avoid utility CSS frameworks
- Keep typography readable and serif-focused
- Avoid heavy visual clutter

### Agents MUST NOT:
- introduce Tailwind
- introduce Bootstrap
- introduce utility-heavy frameworks
- use arbitrary spacing without variables
- mix layout and visual concerns
- tightly couple layout to specific components

## WebGL Background

- Must be isolated in `/src/visuals`
- No tight coupling with Astro layout
- Must fail gracefully
- Load after content

## Content Rules

- Blog posts: MDX
- Projects: Markdown (.md), not MDX
- Art: Markdown (.md), not MDX
- Use frontmatter for metadata
- Support tags in blog

## Performance Guidelines

- JS must not block rendering
- Use `client:idle` or `client:visible`
- Avoid unnecessary third-party scripts

## Deployment

- Must build statically
- Compatible with GitHub Pages
- No server-side features
