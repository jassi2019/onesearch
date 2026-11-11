import {
  createHash,
  createHmac,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "crypto";
import { put, head } from "@vercel/blob";

const secret = () => process.env.AUTH_SECRET || process.env.DOWNLOAD_SIGNING_SECRET || "onesearch-dev-secret";
const aesKey = () => createHash("sha256").update(secret()).digest();

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  try {
    const [saltHex, hashHex] = stored.split(":");
    const hash = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
    return timingSafeEqual(hash, Buffer.from(hashHex, "hex"));
  } catch {
    return false;
  }
}

function encrypt(obj) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", aesKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(obj), "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${data.toString("hex")}`;
}

function decrypt(str) {
  const [ivHex, tagHex, dataHex] = str.split(":");
  const decipher = createDecipheriv("aes-256-gcm", aesKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const out = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return JSON.parse(out.toString("utf8"));
}

const userPath = (email) =>
  `users/${createHash("sha256").update(email.toLowerCase().trim()).digest("hex")}.json`;

export async function getUser(email) {
  try {
    const info = await head(userPath(email));
    const res = await fetch(info.url, {
      headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return decrypt(await res.text());
  } catch {
    return null;
  }
}

export async function saveUser(email, record) {
  await put(userPath(email), encrypt(record), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

export function signToken(payload, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const body = b64url(JSON.stringify({ ...payload, exp: Date.now() + maxAgeSeconds * 1000 }));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  try {
    const [body, sig] = token.split(".");
    const expected = createHmac("sha256", secret()).update(body).digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "os_session";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };
}
