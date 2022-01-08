// import any javascript needed by our service worker
//self.importScripts("/data/materialsData.mjs");

// Files to cache
const cacheName = "stratus-lpt-v3";
const contentToCache = [
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

// Installing Service Worker
self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log("[Service Worker] Caching all: app shell and content");
      //await cache.addAll(contentToCache);
      for(let i=0;i<contentToCache.length;i++){
          console.log(contentToCache[i])
          cache.add(contentToCache[i]);
      }
    })()
  );
});

// Fetching content using Service Worker
self.addEventListener("fetch", (e) => {
  console.log(e.request.url);
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) return r;
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) { return; }
      return caches.delete(key);
    }))
  }));
});
