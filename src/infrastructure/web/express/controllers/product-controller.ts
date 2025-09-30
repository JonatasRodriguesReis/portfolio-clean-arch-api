import CreateProduct from "../../../../application/use-cases/create-product";
import { Request, Response } from "express";
import ListAllProducts from "../../../../application/use-cases/list-products";
import FindProductById from "../../../../application/use-cases/find-product-by-id";
import UpdateProduct from "../../../../application/use-cases/update-product";
import DeleteProduct from "../../../../application/use-cases/delete-product";

export class ProductController {
  constructor(
    private createProduct: CreateProduct,
    private listAllProducts: ListAllProducts,
    private findProductById: FindProductById,
    private updateProduct: UpdateProduct,
    private deleteProduct: DeleteProduct
  ) {}

  async create(req: Request, res: Response) {
    const { name, price } = req.body;
    const product = await this.createProduct.execute({ name, price });
    res.status(201).json(product.toJSON());
  }

  async listAll(req: Request, res: Response) {
    const products = await this.listAllProducts.execute();
    res.status(200).json(products.map((product) => product.toJSON()));
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const product = await this.findProductById.execute(id);
      res.status(200).json(product.toJSON());
    } catch (error) {
      const err = error as Error;
      res.status(404).json({ message: err.message }); // Assuming the error message is user-friendly
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, price } = req.body;
    try {
      const product = await this.updateProduct.execute(id, name, price);
      res.status(200).json(product.toJSON());
    } catch (error) {
      const err = error as Error;
      res.status(404).json({ message: err.message }); // Assuming the error message is user-friendly
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await this.deleteProduct.execute(id);
      res.status(204).send();
    } catch (error) {
      const err = error as Error;
      res.status(404).json({ message: err.message }); // Assuming the error message is user-friendly
    }
  }
}
