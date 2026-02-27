// @ts-check
import { defineConfig } from 'astro/config';
import rehypeCallouts from 'rehype-callouts';

import glsl from 'vite-plugin-glsl';

import mdx from '@astrojs/mdx';
import { shikiClassMeta } from './src/plugins/shikiClassMeta.ts';
// import extractTitleAndAbstract from './src/plugins/extractTitleAndAbstract.mjs';

const calloutsOptions = {
  props: {
    /**
     * @param {unknown} _
     * @param {string} type
     */
    containerProps(_, type) {
      return {
        style: `--rc-color: var(--callout-${type}-color);`
      };
    },
  }
};

// https://astro.build/config
export default defineConfig({
  site: "https://ajur.pl",
  vite: {
    plugins: [glsl({
      include: [
        '**/*.glsl', '**/*.wgsl',
        '**/*.vert', '**/*.frag',
        '**/*.vs', '**/*.fs'
      ],
    })],
  },
  integrations: [mdx()],
  output: 'static',
  markdown: {
    rehypePlugins: [[rehypeCallouts, calloutsOptions]],
    // remarkPlugins: [extractTitleAndAbstract],
    shikiConfig: {
      themes: {
        light: 'gruvbox-light-hard',
        dark: 'synthwave-84',
      },
      defaultColor: 'light-dark()',
      transformers: [shikiClassMeta],
    },
  },
  image: {
    responsiveStyles: true,
    layout: 'constrained',
    objectFit: 'cover',
    objectPosition: 'center',
  },
});
