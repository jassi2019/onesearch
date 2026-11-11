import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { blobFetch } from "./pages";

const path = (pageId) => `notifications/${pageId}.json`;

export async function getNotifications(pageId) {
  try {
    const res = await blobFetch(path(pageId));
    return res ? await res.json() : [];
  } catch {
    return [];
  }
}

async function save(pageId, list) {
  await put(path(pageId), JSON.stringify(list), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0
  });
}

export async function addNotification(pageId, notif) {
  const list = await getNotifications(pageId);
  list.unshift({
    id: randomUUID().slice(0, 8),
    read: false,
    createdAt: new Date().toISOString(),
    ...notif
  });
  await save(pageId, list.slice(0, 50));
}

export async function markAllRead(pageId) {
  const list = await getNotifications(pageId);
  if (list.some((n) => !n.read)) {
    await save(pageId, list.map((n) => ({ ...n, read: true })));
  }
}
