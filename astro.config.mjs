// @ts-check
import { defineConfig } from 'astro/config';

import glsl from 'vite-plugin-glsl';

import mdx from '@astrojs/mdx';
// import extractTitleAndAbstract from './src/remark/extractTitleAndAbstract.mjs';

// https://astro.build/config
export default defineConfig({
  site: "https://ajur.pl",
  vite: {
    plugins: [glsl({
      include: [
        '**/*.glsl', '**/*.wgsl',
        '**/*.vert', '**/*.frag',
        '**/*.vs', '**/*.fs'
      ]
    })]
  },
  integrations: [mdx()],
  output: 'static',
  markdown: {
    // remarkPlugins: [extractTitleAndAbstract],
  }
});