import { getStore } from "@netlify/blobs";

const STORE_NAME = "cvs";

function cvStore() {
  return getStore(STORE_NAME);
}

/**
 * Stocke un CV PDF et renvoie la clé générée pour le retrouver plus tard.
 */
export async function uploadCv(buffer: ArrayBuffer): Promise<string> {
  const key = `${crypto.randomUUID()}.pdf`;
  const store = cvStore();
  await store.set(key, buffer, {
    metadata: { uploadedAt: new Date().toISOString() },
  });
  return key;
}

/**
 * Récupère le contenu binaire d'un CV PDF à partir de sa clé.
 */
export async function getCv(key: string): Promise<ArrayBuffer | null> {
  const store = cvStore();
  return store.get(key, { type: "arrayBuffer" });
}