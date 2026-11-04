const CACHE_NAME = "devtask-shell-v1";
const APP_BASE = "/DevTask/";
const SHELL = [APP_BASE, `${APP_BASE}manifest.webmanifest`, `${APP_BASE}icons/icon-192.png`, `${APP_BASE}icons/icon-512.png`];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Never cache Supabase/auth/API responses or user-specific application data.
  if (url.pathname.includes("/rest/") || url.pathname.includes("/auth/") || url.pathname.includes("/storage/")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(APP_BASE)));
    return;
  }
  if (url.pathname.startsWith(APP_BASE)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })));
  }
});
