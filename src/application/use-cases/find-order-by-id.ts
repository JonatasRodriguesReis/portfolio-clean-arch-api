import IOrderRepository from "../../domain/repositories/IOrderRepository";

export default class FindOrderById {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(id: string) {
    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        throw new Error("Order not found");
      }
      return order.toJSON();
    } catch (error) {
      console.error(`Error retrieving order with id ${id}:`, error);
      throw new Error("Failed to retrieve order");
    }
  }
}
