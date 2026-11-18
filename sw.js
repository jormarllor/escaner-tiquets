// Keeps the app working with a weak signal.
// The page itself is fetched from the network first (so updates show up at once) and falls back to the cache offline;
// the other files are served from cache and refreshed in the background.
const CACHE = "tiquets-v4";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "jspdf.umd.min.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;               // never touch the email POST
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;           // never touch the Google script
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request, { cache: "no-store" }).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./", copy)); }
      return res;
    }).catch(() => caches.match("./").then((hit) => hit || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => {
    const net = fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
