import { getStore } from "@netlify/blobs";

const STORE_NAME = "cvs";

export function getCvStore() {
  return getStore(STORE_NAME);
}

export function generateCvKey(originalName: string) {
  const ext = originalName.toLowerCase().endsWith(".pdf") ? "pdf" : "pdf";
  return `${crypto.randomUUID()}.${ext}`;
}

export async function getCv(key: string): Promise<ArrayBuffer | null> {
  const store = getCvStore();
  const fichier = await store.get(key, { type: "arrayBuffer" });
  return fichier ?? null;
}