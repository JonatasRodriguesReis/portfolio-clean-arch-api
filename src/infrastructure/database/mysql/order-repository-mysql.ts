import Order, { OrderStatus } from "../../../domain/entities/Order";
import IOrderRepository from "../../../domain/repositories/IOrderRepository";
import { pool } from "../../../config/mysql-config-database";
import Product from "../../../domain/entities/Product";
import { v4 as uuid } from "uuid";
import ICacheRepository from "../../../domain/repositories/ICacheRepository";

export default class OrderRepositoryMySQL implements IOrderRepository {
  constructor(private cache: ICacheRepository) {}

  async findById(id: string): Promise<Order | null> {
    try {
      // read-through caching: check the cache first
      const cacheKey = `order:${id}`;
      const cachedOrder = await this.cache.get<any>(cacheKey);
      if (cachedOrder) {
        return Order.fromJSON(cachedOrder);
      }

      const sql = `
        SELECT o.id as order_id, o.status as order_status, o.created_at as created_at, o.updated_at as updated_at, 
        item.quantity as item_quantity, p.id as product_id, p.name as product_name, p.price as product_price, p.created_at as product_created_at, 
        p.updated_at as product_updated_at
        FROM orders o
        JOIN order_items item ON o.id = item.order_id
        JOIN products p ON item.product_id = p.id
        WHERE o.id = ?
    `;

      const [rows] = await pool.query(sql, [id]);
      if ((rows as any[]).length === 0) return null;
      const results = rows as any[];
      const orderId = results[0].order_id;
      const orderStatus = results[0].order_status;
      const createdAt = new Date(results[0].created_at);
      const updatedAt = new Date(results[0].updated_at);
      const order = new Order(orderId);
      order.setStatus(orderStatus);
      order.setCreatedAt(createdAt);
      order.setUpdatedAt(updatedAt);
      for (const row of results) {
        const product = {
          id: row.product_id,
          name: row.product_name,
          price: row.product_price,
          createdAt: new Date(row.product_created_at),
          updatedAt: new Date(row.product_updated_at),
        };
        order.addProduct(
          new Product(
            product.id,
            product.name,
            product.price,
            product.createdAt,
            product.updatedAt
          ),
          row.item_quantity
        );
      }

      // Store the order in the cache
      await this.cache.set<any>(cacheKey, order.toJSON(), 360); // Cache for 5 minutes

      return order;
    } catch (error) {
      console.error(`Error in findById: ${error}`);
      throw new Error("Error finding order by ID: " + error);
    }
  }
  async findAll(): Promise<Order[]> {
    try {
      // read-through caching: check the cache first
      const cacheKey = `orders:all`;
      const cachedOrders = await this.cache.get<any[]>(cacheKey);
      if (cachedOrders) {
        return cachedOrders.map((o) => Order.fromJSON(o));
      }

      const sql = `
        SELECT orders.id as order_id, orders.status as order_status, orders.created_at as created_at, orders.updated_at as updated_at, 
        order_items.quantity as item_quantity,products.id as product_id,products.name as product_name,products.price as product_price,products.created_at as product_created_at, 
    products.updated_at as product_updated_at
        FROM orders
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id
    `;

      const [rows] = await pool.query(sql);
      const results = rows as any[];

      // group by order id
      const ordersMap: { [key: string]: Order } = {};
      for (const row of results) {
        const orderId = row.order_id;
        if (!ordersMap[orderId]) {
          const order = new Order(orderId);
          order.setStatus(row.order_status);
          order.setCreatedAt(new Date(row.created_at));
          order.setUpdatedAt(new Date(row.updated_at));
          ordersMap[orderId] = order;
        }
        const product = new Product(
          row.product_id,
          row.product_name,
          row.product_price,
          new Date(row.product_created_at),
          new Date(row.product_updated_at)
        );
        ordersMap[orderId].addProduct(product, row.item_quantity);
      }

      // Store the orders in the cache
      await this.cache.set<any[]>(
        cacheKey,
        Object.values(ordersMap).map((o) => o.toJSON()),
        360
      ); // Cache for 5 minutes

      return Object.values(ordersMap);
    } catch (error) {
      console.error(`Error in findAll: ${error}`);
      throw new Error("Error finding all orders: " + error);
    }
  }
  async save(order: Order): Promise<Order> {
    const orderId = order.getId();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.query(
        "INSERT INTO orders (id, status, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [orderId, order.getStatus(), order.getCreatedAt(), order.getUpdatedAt()]
      );
      for (const item of order.getOrderItems()) {
        const orderItemId = uuid();
        await connection.query(
          "INSERT INTO order_items (id, order_id, product_id, quantity) VALUES (?, ?, ?, ?)",
          [orderItemId, orderId, item.product.getId(), item.quantity]
        );
      }
      await connection.commit();

      // write-through caching: store the order in the cache after saving to DB
      const orderData = order.toJSON();
      await this.cache.set<any>(`order:${orderId}`, orderData, 360); // Cache for 5 minutes
      // Invalidate the all orders cache
      await this.cache.delete(`orders:all`);

      return order;
    } catch (error) {
      await pool.rollback();
      console.error(`Error in save: ${error}`);
      throw new Error("Error saving order: " + error);
    }
  }

  async addProductItem(
    orderId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    try {
      const orderItemId = uuid();
      await pool.query(
        "INSERT INTO order_items (id, order_id, product_id, quantity) VALUES (?, ?, ?, ?)",
        [orderItemId, orderId, productId, quantity]
      );

      // Invalidate the order cache
      await this.cache.delete(`order:${orderId}`);
    } catch (error) {
      console.error(`Error in addProductItem: ${error}`);
      throw new Error("Error adding product item: " + error);
    }
  }

  async removeProductItem(orderId: string, productId: string): Promise<void> {
    try {
      await pool.query(
        "DELETE FROM order_items WHERE order_id = ? AND product_id = ?",
        [orderId, productId]
      );

      // Invalidate the order cache
      await this.cache.delete(`order:${orderId}`);
    } catch (error) {
      console.error(`Error in removeProductItem: ${error}`);
      throw new Error("Error removing product item: " + error);
    }
  }

  async updateStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    try {
      await pool.query(
        `
            UPDATE orders 
            SET status = ?, updated_at = NOW()
            WHERE id = ?

        `,
        [newStatus, orderId]
      );

      // Invalidate the order cache
      await this.cache.delete(`order:${orderId}`);
    } catch (error) {
      console.error(`Error in updateStatus: ${error}`);
      throw new Error("Error updating order status: " + error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await pool.query("DELETE FROM orders WHERE id = ?", [id]);

      // Invalidate the cache after deleting from DB
      await this.cache.delete(`order:${id}`);
    } catch (error) {
      console.error(`Error in delete: ${error}`);
      throw new Error("Error deleting order: " + error);
    }
  }
}
