# OneSearch 🔍🖼️

**Live demo:** https://onesearch-lm.vercel.app

**A meta image search engine** — search multiple free stock-photo platforms (Openverse, Unsplash, Pexels, Pixabay) from a single search bar, with unified filters and a Pinterest-style masonry grid.

**Works out of the box** — Openverse needs no API key, so you can run the app and search immediately. Add free keys for the other sources when you want more results.

> One query → every platform. No more juggling 5 browser tabs to find the right image.

## ✨ Features

### Search
- **Unified search** — one query fans out to Openverse, Unsplash, Pexels, Pixabay and Pinterest in parallel, with cross-source deduplication
- **Voice search** — tap the mic and speak your query (Web Speech API, Chrome/Edge/Safari)
- **AI related-search suggestions** — via Claude (if `ANTHROPIC_API_KEY` set), falling back to the free keyless Pollinations LLM, then Datamuse
- **Rich filters, all auto-refreshing** — orientation, color, Low/High/Ultra quality, Most relevant/Newest sort, Photos/Illustrations/Vectors type, commercial-use license
- **In-app lightbox** — images open in a viewer with keyboard navigation instead of redirecting
- **Resolution-choice downloads** — Low/High/Ultra HD originals plus Instagram/Story/YouTube crops rendered server-side with sharp through a signed proxy
- **Safe search** — provider-level filters (Unsplash `content_filter=high`, Openverse `mature=false`, Pixabay SafeSearch) plus a server-side blocklist for explicit queries

### Accounts & social
- **Signup/login** — scrypt-hashed passwords, AES-encrypted user records in a private Vercel Blob store, HMAC session cookies; **Google OAuth** one-click login
- **Profiles** — name, gender, bio, Personal/Business account type, and a cropped profile photo
- **Creator pages** — every user gets a public page (`/u/<id>`) where they upload their own images (processed with sharp, served via an authenticated proxy)
- **Follow system** — follow/unfollow creator pages, with follower counts and a Creators discovery page
- **Favourites & boards** — heart images into Favourites or save them to named boards

### Monetization scaffold
- Pricing page with Free/Pro/Team tiers and a demo checkout flow (Stripe-ready)
- **Source toggles** — include/exclude any platform with one click
- **Filters** — orientation (landscape / portrait / square) and dominant color, mapped to each provider's native API filters
- **Interleaved results** — results from all sources are mixed fairly so no single platform dominates the grid
- **Masonry grid** — responsive Pinterest-style layout (4 → 1 columns)
- **Attribution built-in** — every image links to its photographer and original platform page
- **Load more** — paginated fetching across all active sources
- **Graceful degradation** — missing API keys simply disable that source (with a visible notice) instead of breaking the app

## 🏗️ Architecture

```
app/
  page.js               → Landing page (server component)
  layout.js             → Root layout + metadata
  globals.css           → Dark theme, masonry grid styles
  api/search/route.js   → GET /api/search — validates params, calls aggregator
components/
  SearchApp.jsx         → Search bar, filters, state (client component)
  ImageGrid.jsx         → Masonry grid with source badges
lib/
  aggregate.js          → Fans out to providers via Promise.allSettled, interleaves results
  providers/
    unsplash.js         → Unsplash Search API adapter
    pexels.js           → Pexels Search API adapter
    pixabay.js          → Pixabay API adapter
```

Each provider adapter normalizes its platform's response into a common shape:

```js
{ id, source, thumb, full, width, height, alt, photographer, photographerUrl, pageUrl }
```

Adding a new platform = one new file in `lib/providers/` + one entry in the `PROVIDERS` map in `lib/aggregate.js`.

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/onesearch.git
cd onesearch
npm install
```

### 2. Get free API keys

| Provider | Sign up at | Free tier |
|----------|-----------|-----------|
| Openverse | **No key needed** | ~20 req/min anonymous |
| Unsplash | [unsplash.com/developers](https://unsplash.com/developers) | 50 req/hour (demo) |
| Pexels | [pexels.com/api](https://www.pexels.com/api/) | 200 req/hour, 20k/month |
| Pixabay | [pixabay.com/api/docs](https://pixabay.com/api/docs/) | 100 req/minute |
| Pinterest | [developers.pinterest.com](https://developers.pinterest.com) | OAuth token required — Pinterest has no keyless/public search API; create an app and request trial access |

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your keys:

```env
UNSPLASH_ACCESS_KEY=your_key_here
PEXELS_API_KEY=your_key_here
PIXABAY_API_KEY=your_key_here
PINTEREST_ACCESS_TOKEN=your_oauth_token_here
```

You can start with **zero** keys (Openverse works without one) — sources without a key are automatically disabled.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search away.

## 🔌 API

### `GET /api/search`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — (required) | Search query |
| `sources` | csv | all | e.g. `openverse,unsplash,pexels` |
| `page` | int | `1` | Page number (per source) |
| `perPage` | int | `12` | Results per source (max 30) |
| `orientation` | enum | — | `landscape` \| `portrait` \| `square` |
| `color` | enum | — | `red` `orange` `yellow` `green` `blue` `black` `white` `gray` |

**Example:**

```bash
curl "http://localhost:3000/api/search?q=mountain%20sunset&sources=unsplash,pixabay&orientation=landscape&color=orange"
```

**Response:**

```json
{
  "query": "mountain sunset",
  "page": 1,
  "results": [ { "id": "unsplash-abc123", "source": "unsplash", "thumb": "…", "full": "…", "photographer": "…", "pageUrl": "…" } ],
  "sources": [
    { "name": "unsplash", "enabled": true, "count": 12, "total": 5230 },
    { "name": "pixabay", "enabled": true, "count": 12, "total": 812 }
  ],
  "errors": []
}
```

## 🗺️ Roadmap

- [ ] More sources: Freepik, Flickr, Wikimedia Commons
- [ ] Paid stock sources with affiliate links (Shutterstock, Adobe Stock)
- [ ] AI query expansion ("cozy morning" → coffee, sunrise, warm light…)
- [ ] Reverse image search (CLIP embeddings)
- [ ] User accounts + saved collections / mood boards
- [ ] AI image generation fallback when no good results found
- [ ] Stripe subscriptions (Free / Pro / Team tiers)

## ⚖️ Licensing Note

OneSearch does **not** host or redistribute any images. It queries each platform's **official public API** and links back to the original page and photographer. Every image remains governed by its platform's license (Unsplash License, Pexels License, Pixabay Content License). Always check the license before commercial use.

## 🛠️ Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router + middleware auth gating)
- React 18
- Plain CSS (no framework — masonry via CSS columns, animated 3D background)
- [sharp](https://sharp.pixelplumbing.com/) for server-side image resizing
- [Vercel Blob](https://vercel.com/docs/vercel-blob) (private store) for users, creator pages and uploads
- Official REST APIs: Unsplash, Pexels, Pixabay, Openverse, Pinterest
- Google OAuth 2.0 for social login

## ☁️ Deployment

Deployed on [Vercel](https://vercel.com). To deploy your own:

```bash
npx vercel link
npx vercel env add UNSPLASH_ACCESS_KEY production
npx vercel env add PIXABAY_API_KEY production
npx vercel --prod
```

## 📄 License

MIT — see [LICENSE](LICENSE).
