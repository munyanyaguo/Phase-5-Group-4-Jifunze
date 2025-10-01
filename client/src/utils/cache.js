// src/utils/cache.js
// Simple cache utility with expiration

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cache = {
  set(key, data, duration = CACHE_DURATION) {
    const item = {
      data,
      timestamp: Date.now(),
      duration
    };
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache set failed:', e);
    }
  },

  get(key) {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const { data, timestamp, duration } = JSON.parse(item);
      const age = Date.now() - timestamp;

      if (age > duration) {
        // Cache expired
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (e) {
      console.warn('Cache get failed:', e);
      return null;
    }
  },

  clear(key) {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  },

  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Cache clearAll failed:', e);
    }
  }
};
