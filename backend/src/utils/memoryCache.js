const cache = new Map();

export const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

export const setCache = (key, value, ttlMs = 30000) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
  return value;
};

export const remember = async (key, loader, ttlMs = 30000) => {
  const cached = getCache(key);
  if (cached !== null) return cached;
  return setCache(key, await loader(), ttlMs);
};

export const clearCache = (prefix = '') => {
  for (const key of cache.keys()) {
    if (!prefix || key.startsWith(prefix)) cache.delete(key);
  }
};
