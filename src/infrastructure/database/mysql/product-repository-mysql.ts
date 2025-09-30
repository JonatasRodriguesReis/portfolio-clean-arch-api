import Product from "../../../domain/entities/Product";
import IProductRepository from "../../../domain/repositories/IProductRepository";
import { pool } from "../../../config/mysql-config-database";
import { QueryResult } from "mysql2";
import ICacheRepository from "../../../domain/repositories/ICacheRepository";

export default class ProductRepositoryMySQL implements IProductRepository {
  constructor(private cache: ICacheRepository) {}

  async save(product: Product): Promise<Product> {
    try {
      await pool.query(
        "INSERT INTO products (id, name, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [
          product.getId(),
          product.getName(),
          product.getPrice(),
          product.getCreatedAt(),
          product.getUpdatedAt(),
        ]
      );

      // Write-through caching: store the product in the cache after saving to DB
      const productData = product.toJSON();
      await this.cache.set<any>(`product:${product.getId()}`, productData, 360); // Cache for 5 minutes

      // Invalidate the all products cache
      await this.cache.delete(`products:all`);

      return product;
    } catch (error) {
      console.error(`Error saving product: ${error}`);
      throw new Error(
        "Error saving product: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      // read-through caching: check the cache first
      const cacheKey = `product:${id}`;
      const cachedProduct = await this.cache.get<any>(cacheKey);
      if (cachedProduct) {
        return Product.fromJSON(cachedProduct);
      }

      const sql = "SELECT * FROM products WHERE id = ?";
      const [rows] = await pool.query(sql, [id]);
      if ((rows as any[]).length === 0) return null;
      const results = rows as any[];
      const row = results[0];
      const foundProduct = new Product(
        row.id,
        row.name,
        row.price,
        new Date(row.created_at),
        new Date(row.updated_at)
      );

      // Store in cache before returning
      await this.cache.set<any>(cacheKey, foundProduct.toJSON(), 360); // Cache for 5 minutes

      return foundProduct;
    } catch (error) {
      console.error(`Error finding product by ID: ${error}`);
      throw new Error(
        "Error finding product by ID: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }
  async findAll(): Promise<Product[]> {
    try {
      // read-through caching to check the cache first
      const cacheKey = `products:all`;
      const cachedProducts = await this.cache.get<any[]>(cacheKey);
      if (cachedProducts) {
        return cachedProducts.map((p) => Product.fromJSON(p));
      }

      //Find all products
      const [rows] = await pool.query("SELECT * FROM products");
      const products: Product[] = [];
      for (const row of rows as any[]) {
        products.push(
          new Product(
            row.id,
            row.name,
            row.price,
            new Date(row.created_at),
            new Date(row.updated_at)
          )
        );
      }

      // Store in cache before returning
      await this.cache.set<any[]>(
        cacheKey,
        products.map((p) => p.toJSON()),
        360
      ); // Cache for 5 minutes

      return products;
    } catch (error) {
      console.error(`Error finding all products: ${error}`);
      throw new Error(
        "Error finding all products: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }
  async update(product: Product): Promise<Product> {
    try {
      await pool.query(
        "UPDATE products SET name = ?, price = ?, updated_at = ? WHERE id = ?",
        [
          product.getName(),
          product.getPrice(),
          product.getUpdatedAt(),
          product.getId(),
        ]
      );

      // Update the cache after updating the DB
      const productData = product.toJSON();
      await this.cache.set<any>(`product:${product.getId()}`, productData, 360); // Cache for 5 minutes

      // Invalidate the all products cache
      await this.cache.delete(`products:all`);

      return product;
    } catch (error) {
      console.error(`Error updating product: ${error}`);
      throw new Error(
        "Error updating product: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }
  async delete(id: string): Promise<void> {
    try {
      // Invalidate the cache before deleting from DB
      await this.cache.delete(`product:${id}`);
      // Also invalidate the all products cache
      await this.cache.delete(`products:all`);

      await pool.query("DELETE FROM products WHERE id = ?", [id]);
    } catch (error) {
      console.error(`Error deleting product: ${error}`);
      throw new Error(
        "Error deleting product: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }
}
