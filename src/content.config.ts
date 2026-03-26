import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';
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

const art = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/art" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    thumbnail: image(),
    link: z.url().optional(),
    article: z.string().optional(),
    mediaType: z.enum(["image", "audio", "video", "external"]).optional(),
    embed: z
      .object({
        type: z.enum(["youtube", "soundcloud"]),
        id: z.string()
      })
      .optional()
  })
});

export const collections = { articles, projects, art, misc };
