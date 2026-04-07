// @ts-check
import { defineConfig, fontProviders, envField } from 'astro/config';
import rehypeCallouts from 'rehype-callouts';

import glsl from 'vite-plugin-glsl';

import mdx from '@astrojs/mdx';
import { shikiClassMeta } from './src/plugins/shikiClassMeta.ts';


import cloudflare from '@astrojs/cloudflare';


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
    plugins: [/** @type {any} */(glsl({
      include: [
        '**/*.glsl', '**/*.wgsl',
        '**/*.vert', '**/*.frag',
        '**/*.vs', '**/*.fs'
      ],
    }))],
  },

  integrations: [mdx()],
  output: 'static',

  markdown: {
    rehypePlugins: [[rehypeCallouts, calloutsOptions]],
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

  env: {
    schema: {
      PUBLIC_ART_CDN: envField.string({ context: "client", access: "public", default: '/_art_bucket' }),
    }
  },

  fonts: [{
    provider: fontProviders.google(),
    name: "Anonymous Pro",
    cssVariable: "--font-anonymous-pro",
    optimizedFallbacks: false,
    fallbacks: ['monaco', 'Consolas', 'monospace'],
  }, {
    provider: fontProviders.google(),
    name: "Baskervville",
    cssVariable: "--font-baskervville",
    optimizedFallbacks: false,
    fallbacks: ['Georgia', 'Times', 'Times New Roman', 'serif'],
  }, {
    provider: fontProviders.google(),
    name: "Smooch Sans",
    cssVariable: "--font-smooch-sans",
    optimizedFallbacks: false,
    fallbacks: ['sans-serif'],
  }],

  adapter: cloudflare({
    imageService: {
      build: "compile"
    }
  })
});
