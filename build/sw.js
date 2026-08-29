const CACHE = "tiflis-v1";
const ASSETS = ["/", "/index.html", "/manifest.json", "/logo192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match("/index.html")))
  );
});

// Push bildirişlər
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || "Tiflis Kazino";
  const options = {
    body: data.body || "Yeni bildiriş",
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    actions: data.actions || []
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || "/"));
});
