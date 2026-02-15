/**
 * Static site generator — fetches PocketBase data and outputs plain HTML.
 * Zero framework fingerprints in the output.
 */

import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { config } from "dotenv";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname } from "node:path";

config();

// Data fetching
import {
  getLanguages,
  getProfile,
  getSettings,
  getCategories,
  getSocials,
  getSkills,
  getProjects,
  getProjectBySlug,
  getItemsByCategory,
  getResourcesByProject,
  getResourcesByItem,
} from "../src/lib/api.js";
import { getFileUrl } from "../src/lib/pocketbase.js";
import { generateAccentStyles } from "../src/lib/color.js";
import type { Resource } from "../src/lib/types.js";

// Templates
import { renderHome } from "./templates/home.js";
import { renderProjectsList } from "./templates/projects.js";
import { renderProjectDetail } from "./templates/project.js";
import { renderCategoryPage } from "./templates/category.js";
import { renderNotFound } from "./templates/notfound.js";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");

async function writePage(filePath: string, html: string) {
  const dir = join(filePath, "..");
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, html, "utf-8");
}

async function main() {
  console.log("Fetching data from PocketBase...");

  // Fetch all data in parallel
  const [languages, profile, settings, categories, socials, skills, allProjects, featuredProjects] =
    await Promise.all([
      getLanguages(),
      getProfile(),
      getSettings(),
      getCategories(),
      getSocials(),
      getSkills(),
      getProjects({ published: true }),
      getProjects({ published: true, featured: true }),
    ]);

  if (languages.length === 0) {
    console.error("No languages configured in PocketBase.");
    process.exit(1);
  }

  const defaultLang = languages.find((l) => l.is_default) || languages[0];
  const accentCss = settings?.accent_color ? generateAccentStyles(settings.accent_color) : null;
  const faviconUrl = settings?.favicon ? getFileUrl(settings, settings.favicon) : undefined;
  const siteUrl = process.env.SITE_URL || "";

  // Common data passed to all pages
  const common = { languages, profile, categories, socials, faviconUrl, accentCss, siteUrl };

  // Clean dist (remove contents, not the dir itself in case it's busy)
  try {
    await rm(DIST, { recursive: true, force: true });
  } catch {
    // If dir is busy, remove its contents instead
    const { readdirSync } = await import("node:fs");
    for (const entry of readdirSync(DIST)) {
      await rm(join(DIST, entry), { recursive: true, force: true });
    }
  }
  await mkdir(DIST, { recursive: true });

  // Build Tailwind CSS
  console.log("Building CSS...");
  const cssInput = join(ROOT, "src", "styles", "globals.css");
  const cssOutput = join(DIST, "css", "style.css");
  await mkdir(join(DIST, "css"), { recursive: true });
  execSync(
    `npx @tailwindcss/cli -i "${cssInput}" -o "${cssOutput}" --minify --content "${join(ROOT, "scripts", "templates", "**", "*.ts")},${join(PUBLIC, "js", "main.js")}"`,
    { stdio: "inherit", cwd: ROOT }
  );

  // Copy public/ assets to dist/
  console.log("Copying static assets...");
  await cp(PUBLIC, DIST, { recursive: true });

  // Generate pages
  console.log("Generating pages...");
  let pageCount = 0;

  // Root redirect
  await writePage(
    join(DIST, "index.html"),
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url=/${defaultLang.code}"></head><body></body></html>`
  );
  pageCount++;

  // 404 page
  await writePage(join(DIST, "404.html"), renderNotFound({ faviconUrl, accentCss, siteUrl }));
  pageCount++;

  for (const lang of languages) {
    const langCode = lang.code;

    // Homepage
    await writePage(
      join(DIST, langCode, "index.html"),
      renderHome({
        lang: langCode,
        ...common,
        profile: profile!,
        featuredProjects,
        skills,
      })
    );
    pageCount++;

    // Projects index
    await writePage(
      join(DIST, langCode, "projects", "index.html"),
      renderProjectsList({
        lang: langCode,
        ...common,
        projects: allProjects,
      })
    );
    pageCount++;

    // Individual project pages
    for (const project of allProjects) {
      const resources = await getResourcesByProject(project.id);
      await writePage(
        join(DIST, langCode, "projects", project.slug, "index.html"),
        renderProjectDetail({
          lang: langCode,
          ...common,
          project,
          resources,
        })
      );
      pageCount++;
    }

    // Category pages
    for (const category of categories) {
      const items = await getItemsByCategory(category.id);
      const itemResources = new Map<string, Resource[]>();
      await Promise.all(
        items.map(async (item) => {
          const resources = await getResourcesByItem(item.id);
          itemResources.set(item.id, resources);
        })
      );

      await writePage(
        join(DIST, langCode, category.slug, "index.html"),
        renderCategoryPage({
          lang: langCode,
          ...common,
          category,
          items,
          itemResources,
        })
      );
      pageCount++;
    }
  }

  console.log(`\nDone! Generated ${pageCount} pages.`);

  // Start preview server if --preview flag is passed
  if (process.argv.includes("--preview")) {
    startPreview();
  }
}

function startPreview() {
  const PORT = parseInt(process.env.PORT || "3000", 10);

  const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };

  const server = createServer(async (req, res) => {
    let url = req.url || "/";
    // Remove query string
    url = url.split("?")[0];

    // Try the exact path, then path/index.html, then 404
    const candidates = [
      join(DIST, url),
      join(DIST, url, "index.html"),
    ];

    for (const filePath of candidates) {
      try {
        const s = await stat(filePath);
        if (s.isFile()) {
          const ext = extname(filePath);
          const mime = mimeTypes[ext] || "application/octet-stream";
          const content = await readFile(filePath);
          res.writeHead(200, { "Content-Type": mime });
          res.end(content);
          return;
        }
      } catch {}
    }

    // Serve 404 page
    try {
      const notFound = await readFile(join(DIST, "404.html"));
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(notFound);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  server.listen(PORT, () => {
    console.log(`\nPreview server running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
