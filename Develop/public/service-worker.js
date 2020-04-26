import { response } from "express";

const FILES_TO_CACHE = [
    "/",
    "/index.js",
    "/manifest.webmanifest",
    "/style.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",

];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", event => {
    event.waitUntil(
        cashes.open(PRECACHE)
            .then(cache => cache.addALL(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    const currentCashes = [PRECACHE, RUNTIME];
    event.waitUntil(
        cashes.keys() / then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCashes.includes(cacheName));
        }).then(cashesToDelete => {
            return Promise.all(cashesToDelete.map(casheToDelete => {
                return cashes.delete(casheToDelete)
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            cashes.open(RUNTIME).then(cache => {
                return fetch(event.request).then(
                    response => {
                        if (response.status === 200) {//good repsonse  
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    }).catch(err => {
                        return cache.match(event.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    event.respondWith(fetch(event.request).catch(() => {
        return cashes.match(event.request).then((resposne) => {
            if (respsonse) {
                return response;
            } else if (event.request.headers.get("accept").includes("text/html")) {
                return cashes.match("/");
            }
        }); 
    })
    );
}); 