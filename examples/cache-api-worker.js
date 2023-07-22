self.addEventListener('install', (event) => {
  event
    .waitUntil(
      caches.open('v1')
        .then((cache) =>
          cache.addAll([
              `/we-are-developers/examples/cache-api/index.html`,
              `/we-are-developers/examples/scripts/index.js`,
              `/we-are-developers/examples/styles/index.css`,
              `/we-are-developers/examples/database/news.json`,
            ])
        )
    )
})

const cacheFirst = async (request) => {
  if (request.method === 'GET') {
    const cache = await caches.match(request);

    return cache ? cache : fetch(request);
  }

  return fetch(request);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirst(event.request));
})