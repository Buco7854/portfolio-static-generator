/**
 * Icon system — loads lucide icons from lucide-static at build time.
 * Supports any lucide icon name, raw SVG, or plain text/emoji.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const LUCIDE_DIR = join(import.meta.dirname, "..", "..", "node_modules", "lucide-static", "icons");

// Cache loaded icons to avoid reading the same file twice
const cache = new Map<string, string>();

/**
 * Load a lucide icon SVG by name (e.g. "sun", "chevron-down").
 * Returns the SVG string with the license comment stripped, or empty string if not found.
 */
export function getLucideIcon(name: string): string {
  if (cache.has(name)) return cache.get(name)!;

  const filePath = join(LUCIDE_DIR, `${name}.svg`);
  if (!existsSync(filePath)) {
    console.warn(`Lucide icon "${name}" not found at ${filePath}`);
    cache.set(name, "");
    return "";
  }

  let svg = readFileSync(filePath, "utf-8");
  // Strip license comment
  svg = svg.replace(/<!--[\s\S]*?-->\s*/, "").trim();
  // Strip class attribute (we handle sizing via wrapper)
  svg = svg.replace(/\s*class="[^"]*"/, "");
  cache.set(name, svg);
  return svg;
}

// Preload the icons used for the theme toggle script injection
const themeIcons = {
  sun: getLucideIcon("sun"),
  moon: getLucideIcon("moon"),
  laptop: getLucideIcon("laptop"),
};

/**
 * Render an icon value to HTML.
 * Supports: "lucide:name", raw "<svg..." strings, or plain text/emoji.
 */
export function renderIcon(value: string, className = "w-6 h-6"): string {
  if (!value) return "";

  if (value.startsWith("lucide:")) {
    const name = value.split(":")[1];
    const svg = getLucideIcon(name);
    if (!svg) return "";
    return `<span class="${className}" style="display:inline-flex">${svg}</span>`;
  }

  if (value.trim().startsWith("<svg")) {
    const normalized = value
      .replace(/\s(width|height)=["'][^"']*["']/gi, "")
      .replace("<svg", '<svg width="100%" height="100%" style="display:block"');
    return `<span class="${className}" style="display:inline-flex">${normalized}</span>`;
  }

  return `<span class="${className}">${value}</span>`;
}

/**
 * Returns a script tag that injects theme icon SVGs for the JS theme toggle to swap.
 */
export function iconsScript(): string {
  const escape = (s: string) => s.replace(/'/g, "\\'").replace(/\n/g, "");
  return `<script>window._icons={sun:'${escape(themeIcons.sun)}',moon:'${escape(themeIcons.moon)}',laptop:'${escape(themeIcons.laptop)}'}</script>`;
}
