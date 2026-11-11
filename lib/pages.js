import { createHash } from "crypto";
import { put, head } from "@vercel/blob";

export async function blobFetch(path) {
  const info = await head(path);
  const sep = info.url.includes("?") ? "&" : "?";
  const res = await fetch(`${info.url}${sep}ts=${Date.now()}`, {
    headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    cache: "no-store"
  });
  return res.ok ? res : null;
}

export const pageIdFor = (email) =>
  createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);

export async function getPage(pageId) {
  try {
    const res = await blobFetch(`pages/${pageId}.json`);
    return res ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function savePage(page) {
  await put(`pages/${page.pageId}.json`, JSON.stringify(page), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0
  });
}

export async function getPageIndex() {
  try {
    const res = await blobFetch("pages/_index.json");
    return res ? await res.json() : [];
  } catch {
    return [];
  }
}

async function savePageIndex(list) {
  await put("pages/_index.json", JSON.stringify(list), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0
  });
}

export async function ensurePage(user) {
  const pageId = pageIdFor(user.email);
  let page = await getPage(pageId);
  if (!page) page = { pageId, images: [], followers: [] };
  page.name = user.name;
  page.dp = user.dp || "";
  page.bio = user.bio || "";
  page.accountType = user.accountType || "personal";
  await savePage(page);

  const list = await getPageIndex();
  const entry = { pageId, name: page.name, dp: page.dp, accountType: page.accountType };
  const i = list.findIndex((e) => e.pageId === pageId);
  if (i >= 0) list[i] = entry;
  else list.push(entry);
  await savePageIndex(list);

  return page;
}
