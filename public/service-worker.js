const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/index.js",
  "./js/idb.js",
  "icons/icon-72x72.png",
  "icons/icon-96x96.png",
  "icons/icon-128x128.png",
  "icons/icon-144x144.png",
  "icons/icon-152x152.png",
  "icons/icon-192x192.png",
  "icons/icon-384x384.png",
  "icons/icon-512x512.png",
];

const APP_PREFIX = "BudgetApp-";
const VERSION = "version_1";
const CACHE_NAME = APP_PREFIX + VERSION;

// install the service worker
self.addEventListener("install", function (e) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Files have been pre-cached successfully!" + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});
// activate the service worker and remove old data from the cache
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheFiles = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheFiles.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheFiles.indexOf(key) === -1) {
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

// intercept fetch requests
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        return request;
      } else {
        console.log("files have not been cached" + e.request.url);
        return fetch(e.request);
      }
    })
  );
});
