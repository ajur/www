import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, join } from "node:path";

import yaml from "js-yaml";

// --- Paths ---

const ROOT = resolve(import.meta.dirname, "..");
const SCANS_DIR = join(ROOT, "assets_raw", "scans");
const ART_YAML = join(ROOT, "src", "content", "art.yaml");

// --- Types ---

interface ImageRef {
  src: string;
  width: number;
}

interface ArtEntry {
  id: string;
  title: string;
  images: ImageRef[];
  thumbnails: ImageRef[];
  thumbnailRatio: string;
  tags: string[];
  created: string;
  published: string;
  description: string;
}

interface ScanGroup {
  main?: string;
  thumb?: string;
}

// --- Allowed thumbnail ratios ---

const ALLOWED_RATIOS: [string, number][] = [
  ["1:1", 1],
  ["1:2", 0.5],
  ["1:3", 1 / 3],
  ["2:1", 2],
  ["3:1", 3],
  ["2:3", 2 / 3],
  ["3:2", 3 / 2],
  ["3:4", 3 / 4],
  ["4:3", 4 / 3],
];

const RATIO_TOLERANCE = 0.01;

// --- Constants ---

const TAGS_WITH_YEAR = new Set(["inktober", "marchofrobots"]);

// --- Helpers ---

function getImageDimensions(filepath: string): { w: number; h: number } {
  const output = execSync(`identify -format "%w %h" "${filepath}"`, {
    encoding: "utf-8",
  }).trim();
  const [w, h] = output.split(" ").map(Number);
  if (!w || !h) {
    throw new Error(`Failed to read dimensions for ${filepath}`);
  }
  return { w, h };
}

function matchRatio(w: number, h: number): string | null {
  const actual = w / h;
  for (const [label, target] of ALLOWED_RATIOS) {
    if (Math.abs(actual - target) / target < RATIO_TOLERANCE) {
      return label;
    }
  }
  return null;
}

function parseId(id: string): {
  year: string;
  date: string;
  tag: string;
  name: string;
} {
  const parts = id.split("-");
  let idx = 0;

  // Year (mandatory)
  const year = parts[idx++]!;
  if (!/^\d{4}$/.test(year)) {
    throw new Error(`Invalid year in ID "${id}"`);
  }

  // Optional month
  let month: string | undefined;
  if (idx < parts.length && /^\d{2}$/.test(parts[idx]!)) {
    const m = parseInt(parts[idx]!, 10);
    if (m >= 1 && m <= 12) {
      month = parts[idx++]!;
    }
  }

  // Optional day (only if month was found)
  let day: string | undefined;
  if (month && idx < parts.length && /^\d{2}$/.test(parts[idx]!)) {
    const d = parseInt(parts[idx]!, 10);
    if (d >= 1 && d <= 31) {
      day = parts[idx++]!;
    }
  }

  // Tag (single segment)
  const tag = parts[idx++]!;
  if (!tag) {
    throw new Error(`Missing tag in ID "${id}"`);
  }

  // Name (remaining segments)
  const name = parts.slice(idx).join("-");
  if (!name) {
    throw new Error(`Missing name in ID "${id}"`);
  }

  // Build date string
  let date = year;
  if (month) date += `-${month}`;
  if (day) date += `-${day}`;

  return { year, date, tag, name };
}

function capitalize(s: string): string {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// --- Main ---

function main() {
  // 1. Read existing art.yaml
  let existing: ArtEntry[] = [];
  try {
    const raw = readFileSync(ART_YAML, "utf-8").trim();
    if (raw) {
      const parsed = yaml.load(raw);
      if (Array.isArray(parsed)) {
        existing = parsed as ArtEntry[];
      }
    }
  } catch {
    // File doesn't exist or is empty — start fresh
  }

  const existingIds = new Set(existing.map((e) => e.id));

  // 2. Read scans directory and group files
  const files = readdirSync(SCANS_DIR).filter((f) => f.endsWith(".tif"));
  const groups = new Map<string, ScanGroup>();

  for (const file of files) {
    const base = file.replace(/\.tif$/, "");
    const isThumb = base.endsWith("_thumb");
    const id = isThumb ? base.replace(/_thumb$/, "") : base;

    if (!groups.has(id)) {
      groups.set(id, {});
    }
    const group = groups.get(id)!;
    if (isThumb) {
      group.thumb = join(SCANS_DIR, file);
    } else {
      group.main = join(SCANS_DIR, file);
    }
  }

  // 3. Process each group
  const newEntries: ArtEntry[] = [];
  let skipped = 0;
  let errors = 0;

  for (const [id, group] of groups) {
    // Thumb-only: error
    if (!group.main) {
      console.error(`ERROR: Skipping "${id}" — only _thumb version found`);
      errors++;
      continue;
    }

    // Already exists: skip
    if (existingIds.has(id)) {
      skipped++;
      continue;
    }

    // Parse filename
    const { year, date, tag, name } = parseId(id);
    const title = capitalize(name.replace(/-/g, " "));

    // Compute thumbnail ratio
    const dimSource = group.thumb ?? group.main;
    let thumbnailRatio: string;
    try {
      const { w, h } = getImageDimensions(dimSource);
      const matched = matchRatio(w, h);
      if (matched) {
        thumbnailRatio = matched;
      } else {
        thumbnailRatio = `${w}:${h}`;
        console.warn(
          `WARNING: No standard ratio match for "${id}": ${w}:${h}`
        );
      }
    } catch (err) {
      thumbnailRatio = "unknown";
      console.error(`ERROR: Failed to read dimensions for "${id}":`, err);
      errors++;
    }

    // tags:
    const tags = [year, tag];
    if (TAGS_WITH_YEAR.has(tag)) {
      tags.push(tag + year);
    }

    // Build entry
    const now = new Date();
    const published = now.toISOString().replace(/\.\d{3}Z$/, "");

    newEntries.push({
      id,
      title,
      images: [],
      thumbnails: [],
      thumbnailRatio,
      tags,
      created: date,
      published,
      description: "",
    });
  }

  // 4. Append and write
  if (newEntries.length > 0) {
    const all = [...existing, ...newEntries];
    const out = yaml.dump(all, {
      lineWidth: -1,
      quotingType: '"',
      forceQuotes: false,
    });
    writeFileSync(ART_YAML, out, "utf-8");
  }

  // 5. Summary
  console.log(
    `Added ${newEntries.length} new entries. ${skipped} skipped (existing). ${errors} errors.`
  );
}

main();
