import IOrderRepository from "../../domain/repositories/IOrderRepository";
import IProductRepository from "../../domain/repositories/IProductRepository";

export default class AddOrderItem {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(orderId: string, productId: string, quantity: number) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const productItem = await this.productRepository.findById(productId);
    if (!productItem) {
      throw new Error("Product not found");
    }

    try {
      await this.orderRepository.addProductItem(orderId, productId, quantity);
    } catch (error) {
      console.error(`Error adding product item to order: ${error}`);
      throw new Error("Failed to add product item to order");
    }

    const updatedOrder = await this.orderRepository.findById(orderId);
    if (!updatedOrder) {
      throw new Error("Order not found after update");
    }

    return updatedOrder.toJSON();
  }
}
