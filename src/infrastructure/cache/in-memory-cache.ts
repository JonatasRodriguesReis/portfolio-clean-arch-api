import ICacheRepository from "../../domain/repositories/ICacheRepository";
import { inMemoryCacheStore } from "./in-memory-cache-store";

export default class InMemoryCache implements ICacheRepository {
  get<T>(key: string): Promise<T | null> {
    try {
      const data = inMemoryCacheStore.cache.get(key);
      if (!data) return Promise.resolve(null);
      return Promise.resolve(JSON.parse(data) as T);
    } catch (error) {
      console.error(
        `Error getting key ${key} from local memory cache: ${error}`
      );
      throw new Error(
        "Error getting data from from local memory cache: " + error
      );
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      inMemoryCacheStore.cache.set(key, data);
    } catch (error) {
      console.error(`Error setting key ${key} in local memory cache: ${error}`);
      throw new Error("Error setting data in local memory cache: " + error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      inMemoryCacheStore.cache.delete(key);
    } catch (error) {
      console.error(
        `Error deleting key ${key} from local memory cache: ${error}`
      );
      throw new Error("Error deleting data from local memory cache: " + error);
    }
  }
}
