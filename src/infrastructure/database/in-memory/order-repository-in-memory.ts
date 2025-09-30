import Order, { OrderStatus } from "../../../domain/entities/Order";
import ICacheRepository from "../../../domain/repositories/ICacheRepository";
import IOrderRepository from "../../../domain/repositories/IOrderRepository";
import { inMemoryStore } from "./in-memory-store";

export default class OrderRepositoryInMemory implements IOrderRepository {
  constructor(private cache: ICacheRepository) {}

  updateStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const order = inMemoryStore.orders.find(
      (order) => order.getId() === orderId
    );
    order?.setStatus(newStatus);
    return Promise.resolve();
  }
  addProductItem(
    orderId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const order = inMemoryStore.orders.find(
      (order) => order.getId() === orderId
    );
    if (!order) {
      return Promise.reject(new Error("Order not found"));
    }
    const product = inMemoryStore.products.find(
      (product) => product.getId() === productId
    );
    if (!product) {
      return Promise.reject(new Error("Product not found"));
    }
    order.addProduct(product, quantity);
    return Promise.resolve();
  }
  removeProductItem(orderId: string, productId: string): Promise<void> {
    const order = inMemoryStore.orders.find(
      (order) => order.getId() === orderId
    );
    if (!order) {
      return Promise.reject(new Error("Order not found"));
    }
    const product = inMemoryStore.products.find(
      (product) => product.getId() === productId
    );
    if (!product) {
      return Promise.reject(new Error("Product not found"));
    }
    order.removeProduct(product);
    return Promise.resolve();
  }
  findById(id: string): Promise<Order | null> {
    const order = inMemoryStore.orders.find((order) => order.getId() === id);
    return Promise.resolve(order || null);
  }
  findAll(): Promise<Order[]> {
    return Promise.resolve(inMemoryStore.orders);
  }
  save(order: Order): Promise<Order> {
    inMemoryStore.orders.push(order);
    return Promise.resolve(order);
  }

  delete(id: string): Promise<void> {
    const index = inMemoryStore.orders.findIndex(
      (order) => order.getId() === id
    );
    if (index !== -1) {
      inMemoryStore.orders.splice(index, 1);
      return Promise.resolve();
    }
    return Promise.reject(new Error("Order not found"));
  }
}
