import { existsSync, globSync, readFileSync, writeFileSync } from "node:fs";
import { matchesGlob, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
import type { AstroIntegration, AstroIntegrationLogger } from "astro";
import { tagId } from "../tags";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

type TagEntry = { id: string } & Record<string, unknown>;

interface TagsSyncOptions {
  file: string;
  frontmatter: string[];
  lists: string[];
}

function collectUsedTags(root: string, { frontmatter, lists }: TagsSyncOptions, logger: AstroIntegrationLogger) {
  const used = new Map<string, string[]>();
  const add = (tags: unknown, source: string) => {
    if (!Array.isArray(tags)) return;
    const seen = new Set<string>();
    for (const tag of tags.map(String)) {
      if (seen.has(tag)) {
        logger.warn(`Skipping duplicated tag "${tag}" in ${source}`);
      } else if (!tagId.safeParse(tag).success) {
        logger.warn(`Skipping invalid tag "${tag}" in ${source}`);
      } else {
        used.set(tag, [...(used.get(tag) ?? []), source]);
      }
      seen.add(tag);
    }
  };

  for (const file of globSync(frontmatter, { cwd: root })) {
    const frontmatterYaml = readFileSync(resolve(root, file), "utf8").match(FRONTMATTER)?.[1];
    if (frontmatterYaml) add((yaml.load(frontmatterYaml) as { tags?: unknown } | null)?.tags, file);
  }
  for (const file of lists) {
    const entries = yaml.load(readFileSync(resolve(root, file), "utf8")) as { id?: string; tags?: unknown }[] | null;
    for (const entry of entries ?? []) add(entry.tags, `${file}#${entry.id}`);
  }
  return used;
}

function syncTags(root: string, options: TagsSyncOptions, logger: AstroIntegrationLogger) {
  const path = resolve(root, options.file);
  const raw = existsSync(path) ? readFileSync(path, "utf8") : "";
  const hasData = (entry: TagEntry) => Object.keys(entry).length > 1;
  const loaded = ((raw.trim() ? yaml.load(raw) : null) as TagEntry[] | null ?? [])
    .map((entry) => ({ ...entry, id: String(entry.id) }));

  const entries: TagEntry[] = [];
  for (const [id, group] of Map.groupBy(loaded, (entry) => entry.id)) {
    const withData = group.filter(hasData);
    if (group.length > 1) {
      const kept = withData.length > 1 ? "keeping all with data, the last one wins" : "keeping one";
      logger.warn(`Duplicated tag "${id}" in ${options.file}, ${kept}`);
    }
    entries.push(...(withData.length ? withData : group.slice(0, 1)));
  }

  const used = collectUsedTags(root, options, logger);
  for (const [id, sources] of used) {
    if (entries.some((entry) => entry.id === id)) continue;
    entries.push({ id });
    const more = sources.length > 2 ? `, +${sources.length - 2} more` : "";
    logger.info(`New tag "${id}" (${sources.slice(0, 2).join(", ")}${more})`);
  }

  const isUnused = (entry: TagEntry) => !used.has(entry.id) && !hasData(entry);
  const removed = entries.filter(isUnused).map(({ id }) => id);
  if (removed.length) logger.info(`Removed unused tags: ${removed.join(", ")}`);

  const sorted = entries.filter((entry) => !isUnused(entry)).sort((a, b) => a.id.localeCompare(b.id));
  const output = yaml.dump(sorted, { lineWidth: -1 });
  if (output !== raw) writeFileSync(path, output);
}

export default function tagsSync(options: TagsSyncOptions): AstroIntegration {
  let root = "";

  return {
    name: "tags-sync",
    hooks: {
      "astro:config:setup": ({ config, logger }) => {
        root = fileURLToPath(config.root);
        syncTags(root, options, logger);
      },
      "astro:server:setup": ({ server, logger }) => {
        const onChange = (changed: string) => {
          const file = relative(root, changed);
          if (!options.lists.includes(file) && !options.frontmatter.some((glob) => matchesGlob(file, glob))) return;
          try {
            syncTags(root, options, logger);
          } catch (error) {
            logger.error((error as Error).message);
          }
        };
        server.watcher.on("change", onChange);
        server.watcher.on("add", onChange);
        server.watcher.on("unlink", onChange);
      },
    },
  };
}
