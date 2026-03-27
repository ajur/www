import { getCollection } from "astro:content";

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export const getTagsContent = async () => {
  const [articles, projects, art, misc] = await Promise.all([
    getCollection("articles"),
    getCollection("projects"),
    getCollection("art"),
    getCollection("misc"),
  ]);

  const allTagsMap = new Map<string, {
    articles: typeof articles, 
    projects: typeof projects, 
    art: typeof art, 
    misc: typeof misc
  }>();

  [...articles, ...projects, ...art, ...misc].forEach(item => {
    item.data.tags.forEach(tag => {
      if (!allTagsMap.has(tag)) {
        allTagsMap.set(tag, { articles: [], projects: [], art: [], misc: [] });
      }
      const tagData = allTagsMap.get(tag)!;
      tagData[item.collection].push(item as any);
    });
  });

  return allTagsMap;
}
