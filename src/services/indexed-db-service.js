import { openDB } from 'idb';

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
  async createOfflineStory(storyData) {
    const db = await dbPromise;
    const tx = db.transaction(STORE_SYNC, 'readwrite');
    await tx.store.put(storyData);
    await tx.done;
  },

  async getOfflineStories() {
    const db = await dbPromise;
    return db.getAll(STORE_SYNC);
  },

  async deleteOfflineStory(storyId) {
    const db = await dbPromise;
    await db.delete(STORE_SYNC, storyId);
  },
  

  async saveFavoriteStory(story) {
    const db = await dbPromise;
    await db.put(STORE_FAVORITE, story);
  },

  async getAllFavoriteStories() {
    const db = await dbPromise;
    return db.getAll(STORE_FAVORITE);
  },

  async deleteFavoriteStory(storyId) {
    const db = await dbPromise;
    await db.delete(STORE_FAVORITE, storyId);
  },
  
  async getFavoriteStoryById(storyId) {
    const db = await dbPromise;
    return db.get(STORE_FAVORITE, storyId);
  }
};

export default IndexedDBService;