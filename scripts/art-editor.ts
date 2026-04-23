import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { resolve, join, extname } from "node:path";
import { exec, execFile } from "node:child_process";

import yaml from "js-yaml";

// --- Paths ---

const ROOT = resolve(import.meta.dirname, "..");
const ART_YAML = join(ROOT, "src", "content", "art.yaml");
const ART_BUCKET = join(ROOT, "public", "_art_bucket");
const HTML_FILE = join(import.meta.dirname, "art-editor.html");

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

// --- YAML helpers ---

function loadEntries(): ArtEntry[] {
  const raw = readFileSync(ART_YAML, "utf-8").trim();
  if (!raw) return [];
  const entries = yaml.load(raw) as ArtEntry[];
  return Array.isArray(entries) ? entries : [];
}

function saveEntries(entries: ArtEntry[]): void {
  const out = yaml.dump(entries, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  writeFileSync(ART_YAML, out, "utf-8");
}

// --- MIME types ---

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

// --- Server ---

const PORT = Number(process.env.PORT) || 4444;

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  // --- API: list entries ---
  if (req.method === "GET" && path === "/api/entries") {
    const entries = loadEntries();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(entries));
    return;
  }

  // --- API: list tags ---
  if (req.method === "GET" && path === "/api/tags") {
    const entries = loadEntries();
    const tags = [...new Set(entries.flatMap((e) => e.tags))].sort();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(tags));
    return;
  }

  // --- API: update entry ---
  if (req.method === "PUT" && path.startsWith("/api/entries/")) {
    const id = decodeURIComponent(path.slice("/api/entries/".length));
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const update = JSON.parse(body);
        const entries = loadEntries();
        const entry = entries.find((e) => e.id === id);
        if (!entry) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Entry not found" }));
          return;
        }

        if (typeof update.title === "string") entry.title = update.title;
        if (typeof update.description === "string") entry.description = update.description;
        if (Array.isArray(update.tags)) entry.tags = update.tags;

        saveEntries(entries);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // --- API: run script ---
  if (req.method === "POST" && path === "/api/run") {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const { script } = JSON.parse(body);
        if (script !== "art:update" && script !== "art:convert") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Unknown script" }));
          return;
        }
        console.log(`[run] npm run ${script}`);
        execFile("npm", ["run", script], { cwd: ROOT }, (err, stdout, stderr) => {
          const output = (stdout || "") + (stderr || "");
          if (err) {
            console.error(`[run] ${script} failed:`, err.message);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message, output }));
          } else {
            console.log(`[run] ${script} done`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, output }));
          }
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // --- Serve images ---
  if (req.method === "GET" && path.startsWith("/images/")) {
    const filename = decodeURIComponent(path.slice("/images/".length));
    // Prevent path traversal
    if (filename.includes("..") || filename.includes("/")) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }
    const filepath = join(ART_BUCKET, filename);
    if (!existsSync(filepath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = extname(filename).toLowerCase();
    const mime = MIME[ext] ?? "application/octet-stream";
    const data = readFileSync(filepath);
    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=3600",
    });
    res.end(data);
    return;
  }

  // --- Main page ---
  if (req.method === "GET" && (path === "/" || path === "/index.html")) {
    const html = readFileSync(HTML_FILE, "utf-8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Art editor running at http://localhost:${PORT}`);
  // Auto-open on macOS
  exec(`open http://localhost:${PORT}`);
});
