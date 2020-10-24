/*
	Cache Service Worker template by mrc 2019
	mostly based in:
	https://github.com/GoogleChrome/samples/blob/gh-pages/service-worker/basic/service-worker.js
	https://github.com/chriscoyier/Simple-Offline-Site/blob/master/js/service-worker.js
	https://gist.github.com/kosamari/7c5d1e8449b2fbc97d372675f16b566e	
	
	Note for GitHub Pages:
	there can be an unexpected behaviour (cache not updating) when site is accessed from
	https://user.github.io/repo/ (without index.html) in some browsers (Firefox)
	use absolute paths if hosted in GitHub Pages in order to avoid it
	also invoke sw with an absolute path:
	navigator.serviceWorker.register('/repo/_cache_service_worker.js', {scope: '/repo/'})
*/

var PRECACHE_ID='minidex-bw';
var PRECACHE_VERSION='v5';
var PRECACHE_URLS=[
'/minidex/bw/index.html','/minidex/bw/',
'/minidex/bw/manifest.json',

/* core */
'/minidex/core/minidex_v1.css',
'/minidex/core/minidex_v1.js',
'/minidex/core/locale_en.js',
'/minidex/core/locale_es.js',

/* specific game data */
'/minidex/core/data/game_gen5_bw.js',
'/minidex/core/data/pokemon_gen5.js',
'/minidex/core/data/encounters_gen5_bw.js',
'/minidex/core/data/more_info_gen5.js',
'/minidex/core/data/learnsets_gen5.js',

/* specific assets */
'/minidex/bw/resources/favicon16.png',
'/minidex/bw/resources/favicon192.png',
'/minidex/core/icons_3ds.png',

/* common assets */
'/minidex/core/pokemon_top.png',
'/minidex/core/pokemon_header.png',
'/minidex/core/header_common.png',
'/minidex/core/header_gen1.png',
'/minidex/core/sprites.png'
];



// install event (fired when sw is first installed): opens a new cache
self.addEventListener('install', evt => {
	evt.waitUntil(
		caches.open('precache-'+PRECACHE_ID+'-'+PRECACHE_VERSION)
			.then(cache => cache.addAll(PRECACHE_URLS))
			.then(self.skipWaiting())
	);
});


// activate event (fired when sw is has been successfully installed): cleans up old outdated caches
self.addEventListener('activate', evt => {
	evt.waitUntil(
		caches.keys().then(cacheNames => {
			return cacheNames.filter(cacheName => (cacheName.startsWith('precache-'+PRECACHE_ID+'-') && !cacheName.endsWith('-'+PRECACHE_VERSION)));
		}).then(cachesToDelete => {
			return Promise.all(cachesToDelete.map(cacheToDelete => {
				console.log('delete '+cacheToDelete);
				return caches.delete(cacheToDelete);
			}));
		}).then(() => self.clients.claim())
	);
});


// fetch event (fired when requesting a resource): returns cached resource when possible
self.addEventListener('fetch', evt => {
	if(evt.request.url.startsWith(self.location.origin)){ //skip cross-origin requests
		evt.respondWith(
			caches.match(evt.request).then(cachedResource => {
				if (cachedResource) {
					return cachedResource;
				}else{
					return fetch(evt.request);
				}
			})
		);
	}
});