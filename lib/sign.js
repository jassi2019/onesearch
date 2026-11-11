import crypto from "crypto";

const secret = () => process.env.DOWNLOAD_SIGNING_SECRET || "onesearch-dev-secret";

export function signUrl(url) {
  return crypto.createHmac("sha256", secret()).update(url).digest("hex").slice(0, 32);
}

export function verifyUrl(url, sig) {
  const expected = signUrl(url);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig || ""));
  } catch {
    return false;
  }
}
