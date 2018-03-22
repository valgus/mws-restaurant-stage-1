var RESTAURANT_CACHE = 'restaurants-cache-v1';
var urls = [
  '/',
  '/css/styles.css',
  '/css/responsive-index.css',
  '/css/responsive-restaurant.css',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/dbhelper.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(RESTAURANT_CACHE)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urls);
      })
  );
});


self.addEventListener('fetch', (event) => {
  console.log(event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
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
