import PocketBase from "pocketbase";

function getApiBaseUrl(): string {
  const url = process.env.POCKETBASE_URL;
  if (url) return url;
  throw new Error("Missing POCKETBASE_URL environment variable.");
}

export function getPb(): PocketBase {
  const pb = new PocketBase(getApiBaseUrl());
  pb.autoCancellation(false);
  return pb;
}

type PBFileRecord = {
  id: string;
  collectionId: string;
  collectionName: string;
};

/**
 * File URL for use in HTML.
 * Files are downloaded to public/files/ at build time by scripts/download-files.ts
 * and served as static assets.
 */
export function getFileUrl(record: PBFileRecord, filename: string): string {
  return `/files/${record.collectionName}/${record.id}/${filename}`;
}
