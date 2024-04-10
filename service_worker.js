const VERSION = "v1";
const HOST = location.protocol + '//' + location.host;
const FILECACHE = [
    HOST + "/css/bootstrap.css",
    HOST + "/js/form.js",
    HOST + "/manifest.json",
    HOST + "/offline/games.html",
    HOST + "/details.html"
];

self.addEventListener("install", (e) => {
    self.skipWaiting();
    console.log("Version:", VERSION);

    e.waitUntil(
        (async () => {
            const cache = await caches.open(VERSION);

            try {
                await Promise.all(
                    [...FILECACHE, './offline/index.html'].map(async (path) => {
                        try {
                            await cache.add(path);
                            console.log("Cached:", path);
                        } catch (error) {
                            console.error("Cache add error:", error);
                        }
                    })
                );
            } catch (error) {
                console.error("Cache open error:", error);
            }
        })()
    );
});


self.addEventListener('activate', (e) => {
    e.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys.map((k) => {
                    if (!k.includes(VERSION)) return caches.delete(k);
                })
            );
        })()
    );
});


self.addEventListener("fetch", (e) => {
    console.log("Fetch:", e.request.url);

    if (e.request.mode === "navigate" && !e.request.url.endsWith('games.html') && !e.request.url.includes('details.html')) {
        e.respondWith(
            (async () => {
                try {
                    const preloadedResponse = await e.preloadResponse;
                    if (preloadedResponse) return preloadedResponse;

                    return await fetch(e.request);
                } catch (error) {
                    console.error("Fetch error:", error);
                    const cache = await caches.open(VERSION);
                    return await cache.match("/offline/index.html");
                }
            })()
        );
    } else if (FILECACHE.includes(e.request.url)) {
        e.respondWith(caches.match(e.request));
    }

    if(e.request.url.endsWith('games.html')) {
        e.respondWith(caches.match("/offline/games.html"));
    }

    if(e.request.url.includes('details.html')) {
        e.respondWith(handleDetailsRequest(e.request));
    }

    async function handleDetailsRequest(request) {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.search);
        const name = searchParams.get('name');
        const summary = searchParams.get('summary');
        const image = searchParams.get('image');
    
        const cache = await caches.open(VERSION);
        const cacheKey = `details-${name}-${summary}-${image}`;
    
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        } else {
            try {
                const response = await fetch(request);
                await cache.put(cacheKey, response.clone());
                return response;
            } catch (error) {
                console.error("Fetch error:", error);
                return await cache.match("/details.html");
            }
        }
    }
    
});

