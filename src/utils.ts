import { getCollection, type CollectionEntry } from "astro:content";
import { defaultTagGroup } from "~/tags";

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export const getTags = async () => {
  const [tags, articles, projects, art, misc] = await Promise.all([
    getCollection("tags"),
    getCollection("articles"),
    getCollection("projects"),
    getCollection("art"),
    getCollection("misc"),
  ]);

  const tagsData = new Map(tags.map((tag) => [tag.id, tag.data]));

  const allTagsMap = new Map<string, {
    tag: CollectionEntry<"tags">["data"],
    articles: typeof articles,
    projects: typeof projects,
    art: typeof art,
    misc: typeof misc
  }>();

  [...articles, ...projects, ...art, ...misc].forEach(item => {
    item.data.tags.forEach(tag => {
      if (!allTagsMap.has(tag)) {
        const data = tagsData.get(tag) ?? { id: tag, group: defaultTagGroup };
        allTagsMap.set(tag, { tag: data, articles: [], projects: [], art: [], misc: [] });
      }
      const tagData = allTagsMap.get(tag)!;
      tagData[item.collection].push(item as any);
    });
  });

  return allTagsMap;
}
