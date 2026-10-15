import { z } from "astro/zod";

export const tagId = z.stringFormat("tag-id", /^[a-z0-9]+(-[a-z0-9]+)*$/);

interface TagGroupConfig {
  label: string;
  sort?: "asc" | "desc";
}

const groups = {
  year: { label: "years", sort: "desc" },
  series: { label: "series" },
  tech: { label: "tech" },
  medium: { label: "mediums" },
  topic: { label: "topics" },
} satisfies Record<string, TagGroupConfig>;

export type TagGroup = keyof typeof groups;

export const tagGroups: Record<TagGroup, TagGroupConfig> = groups;

export const tagGroupIds = Object.keys(groups) as [TagGroup, ...TagGroup[]];

export const defaultTagGroup: TagGroup = "topic";
