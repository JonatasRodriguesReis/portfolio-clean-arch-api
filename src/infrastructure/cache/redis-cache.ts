import ICacheRepository from "../../domain/repositories/ICacheRepository";
import { redisClient } from "../../config/redis-cache-config";

export default class RedisCache implements ICacheRepository {
  private client;
  constructor() {
    this.client = redisClient;
  }

  private async connectClient() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  private async disconnectClient() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      await this.connectClient();
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error getting key ${key} from Redis: ${error}`);
      throw new Error("Error getting data from cache: " + error);
    } finally {
      await this.disconnectClient();
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      await this.connectClient();
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, data);
      } else {
        await this.client.set(key, data);
      }
    } catch (error) {
      console.error(`Error setting key ${key} in Redis: ${error}`);
      throw new Error("Error setting data in cache: " + error);
    } finally {
      await this.disconnectClient();
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.connectClient();
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key} from Redis: ${error}`);
      throw new Error("Error deleting data from cache: " + error);
    } finally {
      await this.disconnectClient();
    }
  }
}
