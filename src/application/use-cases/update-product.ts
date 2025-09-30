import IProductRepository from "../../domain/repositories/IProductRepository";

export default class UpdateProduct {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: string, name: string, price: number) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    product.changeName(name);
    product.changePrice(price);
    return this.productRepository.update(product);
  }
}
