import IOrderRepository from "../../domain/repositories/IOrderRepository";

export default class FindAllOrder {
  constructor(private orderRepository: IOrderRepository) {}

  async execute() {
    try {
      const orders = await this.orderRepository.findAll();
      return orders.map((order) => order.toJSON());
    } catch (error) {
      console.error(`Error retrieving orders: ${error}`);
      throw new Error("Failed to retrieve orders");
    }
  }
}
