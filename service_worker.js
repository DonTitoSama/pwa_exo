const VERSION = "v14";
const HOST = location.protocol + '//' + location.host;
const FILECACHE = [
    HOST + "/css/bootstrap.css",
    HOST + "/js/form.js",
    HOST + "/manifest.json"
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

    if (e.request.mode === "navigate") {
        e.respondWith(
            (async () => {
                try {
                    const preloadedResponse = await e.preloadResponse;
                    if (preloadedResponse) return preloadedResponse;

                    return await fetch(e.request);
                } catch (error) {
                    console.error("Fetch error:", error);
                    const cache = await caches.open(VERSION);
                    return await cache.match("offline/index.html");
                }
            })()
        );
    } else if (FILECACHE.includes(e.request.url)) {
        e.respondWith(caches.match(e.request));
    }
});
