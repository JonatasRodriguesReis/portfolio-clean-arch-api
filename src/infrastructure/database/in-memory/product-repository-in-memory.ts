import Product from "../../../domain/entities/Product";
import ICacheRepository from "../../../domain/repositories/ICacheRepository";
import IProductRepository from "../../../domain/repositories/IProductRepository";
import { inMemoryStore } from "./in-memory-store";

export default class ProductRepositoryInMemory implements IProductRepository {
  constructor(private cache: ICacheRepository) {}

  // In-memory storage for products that can be accessed across instances

  findById(id: string): Promise<Product | null> {
    const product = inMemoryStore.products.find((p) => p.getId() === id);
    return Promise.resolve(product || null);
  }
  findAll(): Promise<Product[]> {
    return Promise.resolve(inMemoryStore.products);
  }
  save(product: Product): Promise<Product> {
    inMemoryStore.products.push(product);
    return Promise.resolve(product);
  }
  update(product: Product): Promise<Product> {
    const index = inMemoryStore.products.findIndex(
      (p) => p.getId() === product.getId()
    );
    if (index !== -1) {
      inMemoryStore.products[index] = product;
      return Promise.resolve(product);
    }
    return Promise.reject(new Error("Product not found"));
  }
  delete(id: string): Promise<void> {
    const index = inMemoryStore.products.findIndex((p) => p.getId() === id);
    if (index !== -1) {
      inMemoryStore.products.splice(index, 1);
      return Promise.resolve();
    }
    return Promise.reject(new Error("Product not found"));
  }
}
