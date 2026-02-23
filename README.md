# ajur.pl - my small cornenr of the internet

Version 2 of the site, created with [Astro](https://astro.build).

## Project Structure

```text
/
├── public/
├── src/
│   ├── pages/                 - astro pages and url map
│   ├── layouts/               - astro components used as layouts
│   ├── components/            - astro components sources
│   ├── styles/                - global css styles
│   ├── visuals/               - source for landing page background animation
│   ├── content/               - content collectors data
│   │   ├── misc/              - md article like subpages of other than art and music
│   │   ├── music/             - music entries, embeds
│   │   ├── art/               - images for gallery
│   │   ├── articles/          - articles mdx files
│   │   └── projects/          - side projects mdx files
│   └── content.config.ts      - content collectors config
├── astro.config.mjs
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

## Tools and libraries used

- I'm not shy to admit, that I used GH copilot with varuous models, to help with dev process.
- [Astro](https://astro.build) - as main static site builder. [Docs](https://docs.astro.build).
- [vite-plugin-glsl](https://www.npmjs.com/package/vite-plugin-glsl) - to ease loading of shaders.
- [webgl-noise](https://github.com/stegu/webgl-noise) - Simplex noise implementation in GLSL

