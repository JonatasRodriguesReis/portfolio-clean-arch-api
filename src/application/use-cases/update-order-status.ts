import IOrderRepository from "../../domain/repositories/IOrderRepository";
import { OrderStatus } from "../../domain/entities/Order";

export default class UpdateOrderStatus {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(id: string, newStatus: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (OrderStatus[newStatus as keyof typeof OrderStatus] === undefined) {
      throw new Error("Invalid order status");
    }

    try {
      await this.orderRepository.updateStatus(
        id,
        OrderStatus[newStatus as keyof typeof OrderStatus]
      );
    } catch (error) {
      console.error(`Error updating order status: ${error}`);
      throw new Error(
        "Failed to update order status" +
          (error instanceof Error ? `: ${error.message}` : "")
      );
    }

    const updatedOrder = await this.orderRepository.findById(id);
    if (!updatedOrder) {
      throw new Error("Order not found after update");
    }

    return updatedOrder.toJSON();
  }
}
