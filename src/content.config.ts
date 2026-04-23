import { defineCollection } from "astro:content";
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    created: z.iso.datetime({ local: true }),
    published: z.date(),
    image: image().optional(),
    imageCaption: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    status: z.string().default("completed"),
    startDate: z.date(),
    lastUpdated: z.date().optional(),
    image: image(),
    url: z.url().optional(),
    links: z.url().array().default([]),
    articles: z.string().array().default([]),
    tags: z.array(z.string()).default([]),
  })
});

const misc = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/misc" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().optional(),
    tags: z.array(z.string()).default([]),
  })
});

const artImageRef = z.object({
  src: z.string(),
  width: z.number(),
});

const art = defineCollection({
  loader: file("./src/content/art.yaml"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    created: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/),
    published: z.iso.datetime({ local: true }),
    thumbnailRatio: z.string().regex(/^\d+:\d+$/),
    tags: z.array(z.string()).default([]),
    maxCssWidth: z.number().optional(),
    images: z.array(artImageRef),
    thumbnails: z.array(artImageRef),
  })
});

export const collections = { articles, projects, art, misc };
