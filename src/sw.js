import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { openDB } from 'idb';

precacheAndRoute(self.__WB_MANIFEST),{
  ignoreURLParametersMatching: [/\.DS_Store$/],
};

registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
  })
);

const API_ENDPOINT = 'https://story-api.dicoding.dev/v1';
const DB_NAME = 'CeritaKuDB';
const DB_VERSION = 1;
const STORE_SYNC = 'sync-stories';
const STORE_FAVORITE = 'favorite-stories';
const STORE_TOKENS = 'tokens';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_SYNC)) {
      db.createObjectStore(STORE_SYNC, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(STORE_FAVORITE)) {
      db.createObjectStore(STORE_FAVORITE, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(STORE_TOKENS)) {
      db.createObjectStore(STORE_TOKENS, { keyPath: 'key' });
    }
  },
});

const IndexedDBService = {
  async getOfflineStories() {
    const db = await dbPromise;
    return db.getAll(STORE_SYNC);
  },
  async deleteOfflineStory(id) {
    const db = await dbPromise;
    await db.delete(STORE_SYNC, id);
  },
};

const getToken = async () => {
  const db = await dbPromise;
  const tokenObj = await db.get(STORE_TOKENS, 'authToken');
  return tokenObj ? tokenObj.value : null;
};

const addStoryFromOffline = async (story) => {
  const token = await getToken();
  if (!token) {
    throw new Error('Token not found');
  }

  const formData = new FormData();
  formData.append('description', story.description);

  if (story.photoBase64) {
    const res = await fetch(story.photoBase64);
    const photoBlob = await res.blob();
    formData.append('photo', photoBlob, 'offline-upload.jpg');
  }

  if (story.lat) formData.append('lat', story.lat);
  if (story.lon) formData.append('lon', story.lon);

  const response = await fetch(`${API_ENDPOINT}/stories`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal menambahkan cerita dari sync');
  }

  return { success: true };
};

const ApiService = { addStoryFromOffline };

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-stories') {
    event.waitUntil(
      (async () => {
        const stories = await IndexedDBService.getOfflineStories();
        for (const story of stories) {
          try {
            await ApiService.addStoryFromOffline(story);
            await IndexedDBService.deleteOfflineStory(story.id);
          } catch (err) {
            console.error('Gagal sinkronisasi cerita offline:', err);
          }
        }
      })()
    );
  }
});

self.addEventListener('push', (event) => {
  let notificationData = {};
  if (event.data) notificationData = event.data.json();

  const options = {
    body: notificationData.body || 'Kabar baru dari CeritaKu!',
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'CeritaKu', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

const FALLBACK_HTML_URL = '/index.html';

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(event.request);
        } catch (err) {
          const cache = await caches.open('runtime-cache');
          const cachedResponse = await cache.match(FALLBACK_HTML_URL);
          return cachedResponse || Response.error();
        }
      })()
    );
  }
});