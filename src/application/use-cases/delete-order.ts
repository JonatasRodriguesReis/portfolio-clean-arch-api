import IOrderRepository from "../../domain/repositories/IOrderRepository";

export default class DeleteOrder {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    try {
      await this.orderRepository.delete(id);
    } catch (error) {
      console.error(`Error deleting order with id ${id}:`, error);
      throw new Error("Failed to delete order");
    }
  }
}
