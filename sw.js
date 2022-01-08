// @ts-no-check

// import any javascript needed by our service worker
//self.importScripts("/data/materialsData.mjs");

// update name whenever an asset changes
const cacheName = "stratus-lpt-2022-01-08-14";

// Files to cache - add evrything required for offline use.
const contentToCache = [
  "/",
  "/index.html",
  "/index.js",
  "/index.css",
  "/manifest.json",
  "/routes.mjs",

  "/assets/404.png",
  "/assets/home.jpeg",
  "/assets/myIcon.png",

  "/data/materialsData.mjs",
  "/data/plyData.mjs",

  "/js/ext/vjs-toolkit/cleanHTML.mjs",

  "/js/lpt/assert.mjs",
  "/js/lpt/batcalcs.mjs",
  "/js/lpt/convert.mjs",
  "/js/lpt/datastore.mjs",
  "/js/lpt/functions.mjs",
  "/js/lpt/layup.mjs",
  "/js/lpt/lpt.mjs",
  "/js/lpt/material.mjs",
  "/js/lpt/matrix.mjs",
  "/js/lpt/moldedTube.mjs",
  "/js/lpt/orientation.mjs",
  "/js/lpt/plyspec.mjs",
  "/js/lpt/printToHTML.mjs",
  "/js/lpt/profile.mjs",
  "/js/lpt/serialize.mjs",
  "/js/lpt/util.mjs",

  "/js/router.mjs",

  "/views/404.html",
  "/views/AbstractView.mjs",
  "/views/staticView.mjs",
  "/views/about.html",
  "/views/barrelCompression.html",
  "/views/barrelCompression.mjs",
  "/views/materialEditView.mjs",
  "/views/materialView.mjs",
  "/views/home.html",
  "/views/materialsListView.mjs",
  "/views/MaterialsCreateView.mjs",
];

// based on: https://stackoverflow.com/questions/33262385/service-worker-force-update-of-new-assets

self.addEventListener("install", (event) => {
  // prevents the waiting, meaning the service worker activates
  // as soon as it's finished installing
  // NOTE: don't use this if you don't want your sw to control pages
  // that were loaded with an older version
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      try {
        // cacheName and contentToCache need to be defined
        const cache = await caches.open(cacheName);
        const total = contentToCache.length;
        let installed = 0;

        await Promise.all(
          contentToCache.map(async (url) => {
            let controller;

            try {
              controller = new AbortController();
              const { signal } = controller;
              // the cache option set to reload will force the browser to
              // request any of these resources via the network,
              // which avoids caching older files again
              const req = new Request(url, { cache: "reload" });
              const res = await fetch(req, { signal });

              if (res && res.status === 200) {
                await cache.put(req, res.clone());
                installed += 1;
              } else {
                console.info(`unable to fetch ${url} (${res.status})`);
              }
            } catch (e) {
              console.info(`unable to fetch ${url}, ${e.message}`);
              // abort request in any case
              controller.abort();
            }
          })
        );

        if (installed === total) {
          console.info(
            `application successfully installed (${installed}/${total} files added in cache)`
          );
        } else {
          console.info(
            `application partially installed (${installed}/${total} files added in cache)`
          );
        }
      } catch (e) {
        console.error(`unable to install application, ${e.message}`);
      }
    })()
  );
});

// Fetching content using Service Worker
self.addEventListener("fetch", (e) => {
  //console.log(e.request.url);
  e.respondWith(
    (async () => {
      //console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      const r = await caches.match(e.request);

      // resource is in cache
      if (r) {
        //console.log(`[Service Worker] Found resource in cache: ${e.request.url}`);
        const expiryDateString = r.headers.get("Expires");
        const expiryDate = expiryDateString
          ? new Date(expiryDateString)
          : undefined;
        if (expiryDate == undefined || new Date() <= expiryDate) {
          // resource is not expired
          console.log(`[Service Worker] Returned from cache: ${e.request.url}`);
          return r;
        }
      }

      // resource is not in cache, fetch it, and then cache it
      const fetchRequest = e.request.clone();
      const response = await fetch(fetchRequest);
      const cache = await caches.open(cacheName);
      console.log(
        `[Service Worker] Fetching & caching new resource: ${e.request.url}`
      );
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

// remove old cache if any
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (nextName) => {
          if (cacheName !== nextName) {
            await caches.delete(nextName);
          }
        })
      );
    })()
  );
});
