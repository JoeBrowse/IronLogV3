/* Service worker for the PWA build.

   The APK never registers this — Capacitor already serves the bundle from
   the device, and a second cache layer in front of that is only a way to
   ship someone a stale app. See registerServiceWorker() in App.jsx, which
   bails out on a native runtime.

   Two strategies, because the two kinds of request want opposite things:

   - Navigations go network-first. Vite writes a fresh index.html on every
     build, so serving a cached one would pin the user to whichever version
     they first opened, forever. Falling back to cache is what makes the
     app open at all in a gym with no signal.

   - Everything else goes cache-first. Vite fingerprints asset filenames
     with a content hash, so a given URL's bytes never change — there is
     nothing to revalidate, and going to the network first would just add
     latency to every launch.
*/

const VERSION = "iron-log-v1";
const SHELL = "./";

self.addEventListener("install", (event) => {
  // Warm the cache with the shell so the very first offline launch works
  // even if the user never navigated again after installing.
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll([SHELL]))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Drop caches from older versions of this worker rather than letting
  // them accumulate against the origin's storage quota.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Only GET is cacheable, and a cross-origin request (the YouTube form
  // links) is none of this worker's business.
  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(SHELL, copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(SHELL).then((hit) => hit || caches.match(request))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((response) => {
        // Opaque and error responses are not worth persisting; caching a
        // 404 would make the failure permanent.
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      });
    }),
  );
});
