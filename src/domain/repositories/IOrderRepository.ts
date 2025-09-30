import Order, { OrderStatus } from "../entities/Order";

export default interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  updateStatus(orderId: string, newStatus: OrderStatus): Promise<void>;
  addProductItem(
    orderId: string,
    productId: string,
    quantity: number
  ): Promise<void>;
  removeProductItem(orderId: string, productId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
