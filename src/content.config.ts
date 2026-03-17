import { defineCollection } from "astro:content";
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(["in_progress", "completed"]).default("in_progress"),
    startDate: z.date(),
    lastUpdated: z.date().optional(),
    image: image(),
    url: z.string().url().optional(),
    links: z.string().url().array().default([]),
    articles: z.string().array().default([]),
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
    link: z.string().url().optional(),
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
