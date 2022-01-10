// @ts-no-check

// import any javascript needed by our service worker
//self.importScripts("/data/materialsData.mjs");

// update name whenever an asset changes
const cacheName = "stratus-lpt-2022-01-10-02";

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

  "/data/batLaminates.mjs",
  "/data/databaseConfig.mjs",
  "/data/materialsData.mjs",
  "/data/plyData.mjs",

  "/js/ext/vjs-toolkit/cleanHTML.mjs",

  "/js/pci/bats/batcalcs.mjs",
  "/js/pci/bats/moldedTube.mjs",
  "/js/pci/bats/profile.mjs",

  "/js/pci/lpt/layup.mjs",
  "/js/pci/lpt/lpt.mjs",
  "/js/pci/lpt/material.mjs",
  "/js/pci/lpt/matrix.mjs",
  "/js/pci/lpt/orientation.mjs",
  "/js/pci/lpt/plyspec.mjs",

  "/js/pci/util/assert.mjs",
  "/js/pci/util/convert.mjs",
  "/js/pci/util/datastore.mjs",
  "/js/pci/util/functions.mjs",
  "/js/pci/util/printToHTML.mjs",
  "/js/pci/util/serialize.mjs",
  "/js/pci/util/util.mjs",

  "/js/database.mjs",
  "/js/router.mjs",
  "/js/state.mjs",

  "/views/404.html",
  "/views/about.html",
  "/views/abstractView.mjs",
  "/views/barrelCompression.html",
  "/views/barrelCompression.mjs",
  "/views/home.html",
  "/views/materialEditView.mjs",
  "/views/materialsCreateView.mjs",
  "/views/materialsListView.mjs",
  "/views/materialsStateView.mjs",
  "/views/materialView.mjs",
  "/views/staticView.mjs",
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