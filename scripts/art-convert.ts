import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, join } from "node:path";

import * as yaml from "js-yaml";

// --- Paths ---

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE_DIRS = [
  join(ROOT, "assets_raw", "scans"),
  join(ROOT, "assets_raw", "digital"),
];
const BUCKET_DIR = join(ROOT, "assets_raw", "bucket");
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
  maxCssWidth: number;
}

// --- Constants ---

const THUMB_UNIT = 200;
const MID_THRESHOLD = 1600;
const FULL_RESAMPLE_DIM = 3200;
const WEBP_QUALITY = 82;

// --- Helpers ---

function getImageDimensions(filepath: string): { w: number; h: number } {
  const output = execSync(`identify -format "%w %h" "${filepath}[0]"`, {
    encoding: "utf-8",
  }).trim();
  const [w, h] = output.split(" ").map(Number);
  if (!w || !h) {
    throw new Error(`Failed to read dimensions for ${filepath}`);
  }
  return { w, h };
}

function getImageInfo(filepath: string): {
  w: number;
  h: number;
  density: number | null;
} {
  const output = execSync(
    `identify -format "%w %h %x %U" "${filepath}[0]"`,
    { encoding: "utf-8" }
  ).trim();
  const parts = output.split(" ");
  const w = Number(parts[0]);
  const h = Number(parts[1]);
  const rawDensity = Number(parts[2]);
  const unit = parts[3];

  let density: number | null = null;
  if (unit === "PixelsPerInch" && rawDensity > 0) {
    density = rawDensity;
  } else if (unit === "PixelsPerCentimeter" && rawDensity > 0) {
    density = rawDensity * 2.54;
  }

  return { w, h, density };
}

function findScan(base: string): string | null {
  for (const dir of SOURCE_DIRS) {
    for (const ext of [".tif", ".tiff"]) {
      const p = join(dir, base + ext);
      if (existsSync(p)) return p;
    }
  }
  return null;
}

// --- Main ---

function main() {
  const raw = readFileSync(ART_YAML, "utf-8").trim();
  if (!raw) {
    console.log("art.yaml is empty, nothing to convert.");
    return;
  }
  const entries = yaml.load(raw) as ArtEntry[];
  if (!Array.isArray(entries) || entries.length === 0) {
    console.log("No entries in art.yaml.");
    return;
  }

  let converted = 0;
  let skipped = 0;
  let errors = 0;
  let yamlDirty = false;

  for (const entry of entries) {
    const mainTif = findScan(entry.id);
    if (!mainTif) {
      console.error(`  ERROR: Source file not found: ${entry.id}.tif(f)`);
      errors++;
      continue;
    }

    const thumbTif = findScan(`${entry.id}_thumb`);
    const hasThumbTif = thumbTif !== null;
    let anyCreated = false;

    // --- _full ---
    const fullName = `${entry.id}_full.webp`;
    const fullPath = join(BUCKET_DIR, fullName);
    let is1200dpi = false;

    if (!existsSync(fullPath)) {
      const info = getImageInfo(mainTif);
      is1200dpi = info.density !== null && Math.abs(info.density - 1200) < 50;
      const maxDim = Math.max(info.w, info.h);

      if (is1200dpi) {
        execSync(
          `magick "${mainTif}[0]" -filter LanczosSharp -distort Resize 50% -quality ${WEBP_QUALITY} "${fullPath}"`
        );
      } else if (maxDim > FULL_RESAMPLE_DIM) {
        const pct = ((FULL_RESAMPLE_DIM / maxDim) * 100).toFixed(2);
        execSync(
          `magick "${mainTif}[0]" -filter LanczosSharp -distort Resize ${pct}% -quality ${WEBP_QUALITY} "${fullPath}"`
        );
      } else {
        execSync(
          `magick "${mainTif}[0]" -quality ${WEBP_QUALITY} "${fullPath}"`
        );
      }
      console.log(`Created ${fullName}`);
      anyCreated = true;
    }

    const fullDims = getImageDimensions(fullPath);

    // --- _mid ---
    const midName = `${entry.id}_mid.webp`;
    const midPath = join(BUCKET_DIR, midName);
    let midDims: { w: number; h: number } | null = null;

    if (Math.max(fullDims.w, fullDims.h) > MID_THRESHOLD) {
      if (!existsSync(midPath)) {
        execSync(
          `magick "${mainTif}[0]" -filter LanczosSharp -resize ${MID_THRESHOLD}x${MID_THRESHOLD} -quality ${WEBP_QUALITY} "${midPath}"`
        );
        console.log(`Created ${midName}`);
        anyCreated = true;
      }
      midDims = getImageDimensions(midPath);
    }

    // --- _thumb ---
    const ratioParts = entry.thumbnailRatio.split(":").map(Number);
    const rw = ratioParts[0]!;
    const rh = ratioParts[1]!;

    // Guard against non-standard ratios (raw pixel values from art:update)
    let newThumbnails: ImageRef[] | null = null;
    if (rw > 4 || rh > 4) {
      console.warn(
        `  WARNING: Non-standard ratio "${entry.thumbnailRatio}" — skipping thumbnail`
      );
    } else {
      const tw = rw * THUMB_UNIT;
      const th = rh * THUMB_UNIT;
      const ratioStr = entry.thumbnailRatio.replace(/:/g, "x");
      const thumbName = `${entry.id}_thumb_${ratioStr}.webp`;
      const thumbPath = join(BUCKET_DIR, thumbName);

      if (!existsSync(thumbPath)) {
        const source = hasThumbTif ? thumbTif : mainTif;
        execSync(
          `magick "${source}[0]" -filter LanczosSharp -resize ${tw}x${th}! -unsharp 0x0.5+1.0+0.05 -quality ${WEBP_QUALITY} "${thumbPath}"`
        );
        console.log(`Created ${thumbName}`);
        anyCreated = true;
      }

      const thumbDims = getImageDimensions(thumbPath);
      newThumbnails = [{ src: thumbName, width: thumbDims.w }];
    }

    // --- Update entry ---
    const newImages: ImageRef[] = [{ src: fullName, width: fullDims.w }];
    if (midDims) {
      newImages.push({ src: midName, width: midDims.w });
    }

    const imagesChanged =
      JSON.stringify(entry.images) !== JSON.stringify(newImages);
    const thumbsChanged =
      newThumbnails !== null &&
      JSON.stringify(entry.thumbnails) !== JSON.stringify(newThumbnails);

    if (imagesChanged || thumbsChanged) {
      entry.images = newImages;
      if (newThumbnails !== null) {
        entry.thumbnails = newThumbnails;
      }
      entry.maxCssWidth = is1200dpi ? Math.floor(fullDims.w / 2) : fullDims.w;
      yamlDirty = true;
    }

    if (anyCreated) {
      converted++;
    } else {
      skipped++;
    }
  }

  // Write art.yaml if anything changed
  if (yamlDirty) {
    const out = yaml.dump(entries, {
      lineWidth: -1,
      quoteStyle: "double",
      forceQuotes: false,
    });
    writeFileSync(ART_YAML, out, "utf-8");
    console.log("\nUpdated art.yaml");
  }

  console.log(
    `\nDone. ${converted} converted, ${skipped} skipped, ${errors} errors.`
  );
}

main();
