import IProductRepository from "../../domain/repositories/IProductRepository";
import Product from "../../domain/entities/Product";
import { v4 as uuid } from "uuid";

export default class CreateProduct {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: { name: string; price: number }) {
    const product = new Product(
      uuid(),
      data.name,
      data.price,
      new Date(),
      new Date()
    );

    return this.productRepository.save(product);
  }
}
