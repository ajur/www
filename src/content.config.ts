import { defineCollection } from "astro:content";
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defaultTagGroup, tagGroupIds, tagId } from './tags';

const tagsField = z.array(z.coerce.string())
  .transform((tags) => [...new Set(tags)].filter((tag) => tagId.safeParse(tag).success))
  .default([]);

const tags = defineCollection({
  loader: file("./src/content/tags.yaml"),
  schema: z.object({
    id: tagId,
    label: z.string().optional(),
    description: z.string().optional(),
    group: z.enum(tagGroupIds).default(defaultTagGroup),
  })
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    created: z.iso.datetime({ local: true }),
    published: z.date(),
    image: image().optional(),
    imageCaption: z.string().optional(),
    kind: z.string(),
    tags: tagsField,
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
    tags: tagsField,
  })
});

const misc = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/misc" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().optional(),
    tags: tagsField,
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
    tags: tagsField,
    maxCssWidth: z.number().optional(),
    images: z.array(artImageRef),
    thumbnails: z.array(artImageRef),
  })
});

export const collections = { tags, articles, projects, art, misc };
