type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await fetcher();
  cache.set(key, {
    value,
    expiresAt: now + ttlSeconds * 1000,
  });

  return value;
}

export function invalidateCache(key: string) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}
