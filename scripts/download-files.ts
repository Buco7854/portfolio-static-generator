/**
 * Downloads all PocketBase files to public/files/ for static serving.
 * Run before the build to make the site fully self-contained.
 */

import PocketBase from "pocketbase";
import { writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { config } from "dotenv";

config(); // Load .env

const PB_URL = process.env.POCKETBASE_URL;
if (!PB_URL) {
  console.error("Missing POCKETBASE_URL in .env");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const PUBLIC_DIR = join(import.meta.dirname, "..", "public");
const FILES_DIR = join(PUBLIC_DIR, "files");

let downloaded = 0;
let skipped = 0;
let failed = 0;

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(
  collectionName: string,
  recordId: string,
  filename: string
): Promise<void> {
  if (!filename) return;

  const localPath = join(FILES_DIR, collectionName, recordId, filename);

  // Skip if already downloaded
  if (await fileExists(localPath)) {
    skipped++;
    return;
  }

  const url = `${PB_URL}/api/files/${collectionName}/${recordId}/${filename}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  WARN: ${url} → ${res.status}`);
      failed++;
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(localPath), { recursive: true });
    await writeFile(localPath, buffer);
    downloaded++;
    console.log(`  ✓ ${collectionName}/${recordId}/${filename}`);
  } catch (err) {
    console.warn(`  WARN: Failed to download ${url}:`, err);
    failed++;
  }
}

async function downloadCollectionFiles(
  collectionName: string,
  fileFields: string[]
): Promise<void> {
  try {
    const records = await pb.collection(collectionName).getFullList();
    for (const record of records) {
      for (const field of fileFields) {
        const value = record[field];
        if (typeof value === "string" && value) {
          await downloadFile(collectionName, record.id, value);
        }
      }
    }
  } catch (err) {
    console.warn(`  WARN: Could not fetch ${collectionName}:`, err);
  }
}

async function main() {
  console.log(`Downloading files from ${PB_URL}...\n`);

  await mkdir(FILES_DIR, { recursive: true });

  // Profile: avatar, resume
  console.log("[profile]");
  await downloadCollectionFiles("profile", ["avatar", "resume"]);

  // Projects: thumbnail, hero_image
  console.log("[projects]");
  await downloadCollectionFiles("projects", ["thumbnail", "hero_image"]);

  // Settings: favicon
  console.log("[settings]");
  await downloadCollectionFiles("settings", ["favicon"]);

  // Resources: file
  console.log("[resources]");
  await downloadCollectionFiles("resources", ["file"]);

  console.log(
    `\nDone: ${downloaded} downloaded, ${skipped} cached, ${failed} failed.`
  );
}

main();
