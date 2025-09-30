import IProductRepository from "../../domain/repositories/IProductRepository";
import Product from "../../domain/entities/Product";
import { v4 as uuid } from "uuid";

export default class ListAllProducts {
  constructor(private productRepository: IProductRepository) {}

  async execute() {
    return this.productRepository.findAll();
  }
}
