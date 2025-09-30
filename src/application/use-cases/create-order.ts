import { v4 as uuid } from "uuid";
import Order from "../../domain/entities/Order";
import Product from "../../domain/entities/Product";
import IProductRepository from "../../domain/repositories/IProductRepository";
import IOrderRepository from "../../domain/repositories/IOrderRepository";

export default class CreateOrder {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(products: { productId: string; quantity: number }[]) {
    //Check products array
    if (Array.isArray(products) === false || products.length === 0) {
      throw new Error("Products array is required");
    }
    console.log("Create order service called with products:", products);
    const orderId = uuid();
    const order = new Order(orderId);
    const orderItems: Product[] = [];
    for (const item of products) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      order.addProduct(product, item.quantity);
      orderItems.push(product);
    }

    try {
      console.log("Saving order:", order);
      await this.orderRepository.save(order);
      return order.toJSON();
    } catch (error) {
      console.error(`Error saving order: ${error}`);
      throw new Error("Failed to create order");
    }
  }
}
