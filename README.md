<div align="center">

![Static Badge](https://img.shields.io/badge/next.js-black?logo=nextdotjs)
![Static Badge](https://img.shields.io/badge/node.js-grey?logo=nodedotjs)
![GitHub stars](https://img.shields.io/github/stars/JUSTCHILL098/cosmic-api?logo=github)
![GitHub forks](https://img.shields.io/github/forks/JUSTCHILL098/cosmic-api?logo=github)
![Static Badge](https://img.shields.io/badge/version-1.0.0-blue)

</div>

## Disclaimer

1. This `api` does not store any files, it only links to the media which is hosted on 3rd party services.
2. This `api` is explicitly made for educational purposes only and not for commercial usage. This repo will not be responsible for any misuse of it.

<p align="center">
  <img src="https://cdn.noitatnemucod.net/thumbnail/300x400/100/bcd84731a3eda4f4a306250769675065.jpg" width="120" height="180" style="border-radius:12px"/>
</p>

# <p align="center">COSMIC — Anime Streaming Embed API</p>

> <p align="center">
> A Next.js streaming embed API with Vidstack player, HLS proxy, skip intro/outro, and auto-domain detection.<br/>
> Drop one iframe on your site and stream anime instantly.
> </p>

---

## Table of Contents

- [Installation](#installation)
  - [Local Installation](#local-installation)
  - [Deployment](#deployment)
- [Embed API](#embed-api)
  - [GET Embed URL](#get-embed-url)
  - [Embed Page](#embed-page)
- [Stream API](#stream-api)
  - [GET Stream](#get-stream)
- [postMessage Events](#postmessage-events)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)
- [Support](#support)

---

## Installation

### Local Installation

Make sure you have **Node.js 18+** installed.

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/JUSTCHILL098/cosmic-api.git
cd cosmic-api
npm install --legacy-peer-deps
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

> No `.env` file required. The site auto-detects its own domain for embed URLs — works on localhost, Vercel, VPS, or any domain.

---

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JUSTCHILL098/cosmic-api)

### Manual (VPS / Node.js)

```bash
npm run build
npm start
```

---

## Embed API

### `GET` Embed URL

```bash
GET /api/embeds/:epId/:lang
```

Returns your own domain's embed URL — **never the source stream**.

#### Parameters

| Parameter | Type   | Description                                          | Required |
| :-------: | :----: | :--------------------------------------------------- | :------: |
| `:epId`   | string | Aniwatch episode ID (the `?ep=` value from aniwatchtv.to) | ✔️ |
| `:lang`   | string | Language track — `sub` or `dub`                     | ✔️       |

#### Example

```javascript
const r = await fetch("/api/embeds/136197/sub");
const { results } = await r.json();

// results.embedUrl → "https://your-domain.com/embeds/136197/sub"
// results.iframe   → full <iframe> HTML snippet
// The m3u8 source is NEVER in this response.
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "embedUrl": "https://your-domain.com/embeds/136197/sub",
    "iframe": "<iframe src=\"https://your-domain.com/embeds/136197/sub\" ...></iframe>",
    "epId": "136197",
    "lang": "sub"
  }
}
```

---

### Embed Page

```bash
GET /embeds/:epId/:lang
```

The actual embed page. Load this in an iframe on your site. Fetches the stream **server-side** and plays it with Vidstack. The m3u8 URL never reaches the browser.

#### Usage

```html
<!-- Basic embed -->
<iframe
  src="https://your-domain.com/embeds/136197/sub"
  width="100%"
  height="100%"
  frameborder="0"
  allowfullscreen
  allow="autoplay; fullscreen; picture-in-picture">
</iframe>

<!-- Responsive 16:9 -->
<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px">
  <iframe
    src="https://your-domain.com/embeds/136197/sub"
    style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"
    allowfullscreen allow="autoplay; fullscreen; picture-in-picture">
  </iframe>
</div>
```

#### Features

| Feature | Description |
| :------ | :---------- |
| 🔒 Source Hidden | HLS m3u8 fetched server-side, never in browser network tab |
| ⏭ Skip Intro/Outro | Translucent glass buttons from API timestamps |
| 📝 Subtitles | All tracks blob-preloaded for instant display |
| ➡️ Auto Next | Sends `complete` event via postMessage |

---

## Stream API

### `GET` Stream

```bash
GET /api/stream/:epId/:lang
```

Internal stream API used by the embed player. Returns a proxied HLS URL.

#### Parameters

| Parameter | Type   | Description              | Required |
| :-------: | :----: | :----------------------- | :------: |
| `:epId`   | string | Aniwatch episode ID      | ✔️       |
| `:lang`   | string | `sub` or `dub`           | ✔️       |

#### Sample Response

```json
{
  "success": true,
  "results": {
    "hlsUrl": "/api/proxy?url=...",
    "tracks": [
      { "src": "...", "label": "English", "kind": "captions", "default": true }
    ],
    "intro": { "start": 0, "end": 89 },
    "outro": { "start": 1460, "end": 1549 },
    "server": "HD-1"
  }
}
```

---

## postMessage Events

The embed player sends events to your parent page via `window.postMessage`.

### Events

| Event      | Data                          | Description              |
| :--------- | :---------------------------- | :----------------------- |
| `time`     | `{ time: number }`            | Fired every second       |
| `complete` | —                             | Episode ended            |
| `error`    | —                             | Stream failed to load    |

### Listen to Events

```javascript
window.addEventListener("message", (event) => {
  const d = event.data;
  if (d?.channel !== "cosmic") return;

  switch (d.event) {
    case "time":
      updateProgress(d.time);
      break;
    case "complete":
      loadNextEpisode();
      break;
    case "error":
      showError();
      break;
  }
});
```

### Full Integration Example

```javascript
const COSMIC = "https://your-domain.com";

async function embed(epId, lang = "sub") {
  const r = await fetch(`${COSMIC}/api/embeds/${epId}/${lang}`);
  const { results } = await r.json();

  const iframe = document.createElement("iframe");
  iframe.src = results.embedUrl;
  iframe.style.cssText = "width:100%;aspect-ratio:16/9;border:0;border-radius:12px";
  iframe.allowFullscreen = true;
  document.getElementById("player").appendChild(iframe);
}

window.addEventListener("message", ({ data }) => {
  if (data?.channel !== "cosmic") return;
  if (data.event === "complete") embed(nextEpId);
  if (data.event === "time") saveProgress(data.time);
});

embed("136197");
```

---

## Pull Requests

- Pull requests are welcomed that address bug fixes, improvements, or new features.
- Fork the repository and create a new branch for your changes.
- Ensure your code follows our coding standards.
- Describe your changes clearly in the pull request, explaining the problem and solution.

---

## Reporting Issues

If you discover any issues or have suggestions for improvement, please open an issue. Provide a clear and concise description of the problem, steps to reproduce it, and any relevant information about your environment.

---

## Support

If you like the project feel free to drop a star ✨. Your appreciation means a lot.

<p align="center">
Made with ❤️ by <a href="https://github.com/JUSTCHILL098" target="_blank">COSMIC</a> 🫰
</p>
