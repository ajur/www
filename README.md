# My small cornenr of the internet

Version 2 of the site, created with [Astro](https://astro.build).

## Project Structure

```text
/
├── public/                    - static assets served as-is
├── assets_raw/                - raw art assets before conversion - not part of git repo
├── scripts/                   - build/conversion helper scripts
├── src/
│   ├── pages/                 - astro pages and url map
│   ├── layouts/               - astro components used as layouts
│   ├── components/            - astro components sources
│   ├── plugins/               - custom astro/remark/shiki plugins
│   ├── styles/                - global css styles
│   ├── visuals/               - source for landing page background animation
│   ├── content/               - content collections data
│   │   ├── art.yaml           - art gallery entries
│   │   ├── misc/              - md article-like subpages
│   │   ├── articles/          - blog articles (md/mdx)
│   │   └── projects/          - side projects descriptions (md)
│   ├── content.config.ts      - content collections config
│   └── utils.ts               - shared utility functions
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## Developing

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run art:update`      | Update art gallery data from source              |
| `npm run art:convert`     | Convert raw art assets for the site              |
| `npm run art:r2copy`      | Upload art assets to Cloudflare R2 bucket        |

Commands related to `art:*` may require additional tools and specific layout of untracked assets_raw directory.

## Tools and libraries used

- I'm not shy to admit, that I used GH copilot with varuous models, to help with dev process.
- [Astro](https://astro.build) - as main static site builder. [Docs](https://docs.astro.build).
- [vite-plugin-glsl](https://www.npmjs.com/package/vite-plugin-glsl) - to ease loading of shaders.
- [psrdnoise](https://github.com/stegu/psrdnoise/) - Simplex noise implementation in GLSL
