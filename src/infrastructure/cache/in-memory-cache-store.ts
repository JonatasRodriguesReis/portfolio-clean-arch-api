export const inMemoryCacheStore = {
  cache: new Map<string, any>(),
  reset() {
    this.cache.clear();
  },
};
