import IOrderRepository from "../../domain/repositories/IOrderRepository";
import IProductRepository from "../../domain/repositories/IProductRepository";

export default class RemoveOrderItem {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(orderId: string, productId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    try {
      await this.orderRepository.removeProductItem(orderId, productId);
    } catch (error) {
      console.error(`Error removing product item from order: ${error}`);
      throw new Error("Failed to remove product item from order");
    }

    const updatedOrder = await this.orderRepository.findById(orderId);
    if (!updatedOrder) {
      throw new Error("Order not found after update");
    }

    return updatedOrder.toJSON();
  }
}
