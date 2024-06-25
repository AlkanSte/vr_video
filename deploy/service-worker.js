const CacheName = 'WonderGolf-static-v1';
const files = [
    "index.html",

    "manifest.json",
    "WonderlandRuntime-LoadingScreen.bin",
    "WonderlandRuntime-physx.wasm",
    "WonderlandRuntime-physx.js",
    "WonderlandRuntime-physx-simd.wasm",
    "WonderlandRuntime-physx-simd.js",
    "WonderlandRuntime-physx-threads.wasm",
    "WonderlandRuntime-physx-threads.js",
    "WonderlandRuntime-physx-threads.worker.js",
    "WonderlandRuntime-physx-simd-threads.wasm",
    "WonderlandRuntime-physx-simd-threads.js",
    "WonderlandRuntime-physx-simd-threads.worker.js",
    ".DS_Store",
    "maid.gif",
    "videoplayback2.mp4",
    "videoplayback.mp4",
    "offline-video.mp4",
    "sfx/unclick.wav",
    "sfx/click.wav",
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CacheName).then(cache => cache.addAll(files) ));
});
self.addEventListener('activate', () => {
    console.log('Service worker initialized.');
});

self.addEventListener('fetch', e => {
    e.respondWith(
        (async () => {
            const r = await caches.match(e.request, {ignoreSearch: true});
            if (r) return r;

            const response = await fetch(e.request);
            const cache = await caches.open(CacheName);
            cache.put(e.request, response.clone());
            return response;
        })()
    );
});
