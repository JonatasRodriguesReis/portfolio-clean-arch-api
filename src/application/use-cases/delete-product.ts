import IProductRepository from "../../domain/repositories/IProductRepository";

export default class DeleteProduct {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    await this.productRepository.delete(id);
  }
}
