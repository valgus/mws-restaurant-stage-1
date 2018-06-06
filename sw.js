var RESTAURANT_CACHE = 'restaurants-cache-v1';
var urls = [
  '/',
  '/css/styles.css',
  '/css/responsive-index.css',
  '/css/responsive-restaurant.css',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/requesthelper.js',
  '/db/index.js',
  'sw.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(RESTAURANT_CACHE)
      .then(function(cache) {
        return cache.addAll(urls);
      })
  );
});


self.addEventListener('fetch', (event) => {
  console.log(event.request.url);
    if (event.request.url.includes('restaurant')) {
      return   event.respondWith(fetch(event.request).then((response) => {return response}));
    }
    event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          function(response) {
            if(!response || response.status !== 200) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(RESTAURANT_CACHE)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch((err) => {
          console.log(err);
          return new Response("It seems that Internet connection was lost ;(");
        });
      })
  );
})


//based on the https://developers.google.com/web/fundamentals/primers/service-workers/
