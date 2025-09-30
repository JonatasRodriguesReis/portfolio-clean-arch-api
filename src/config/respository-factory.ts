import InMemoryCache from "../infrastructure/cache/in-memory-cache";
import RedisCache from "../infrastructure/cache/redis-cache";
import OrderRepositoryInMemory from "../infrastructure/database/in-memory/order-repository-in-memory";
import ProductRepositoryInMemory from "../infrastructure/database/in-memory/product-repository-in-memory";
import OrderRepositoryMySQL from "../infrastructure/database/mysql/order-repository-mysql";
import ProductRepositoryMysql from "../infrastructure/database/mysql/product-repository-mysql";

export function createProductRepository(): any {
  switch (process.env.DB_TYPE) {
    case "mysql":
      return new ProductRepositoryMysql(new RedisCache());
    default:
      return new ProductRepositoryInMemory(new InMemoryCache());
  }
}

export function createOrderRepository(): any {
  switch (process.env.DB_TYPE) {
    case "mysql":
      return new OrderRepositoryMySQL(new RedisCache());
    default:
      return new OrderRepositoryInMemory(new InMemoryCache());
  }
}
