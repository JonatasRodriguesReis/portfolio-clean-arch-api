import express from "express";
import { ProductController } from "./controllers/product-controller";
import CreateProduct from "../../../application/use-cases/create-product";
import { createProductRepository } from "../../../config/respository-factory";
import ListAllProducts from "../../../application/use-cases/list-products";
import FindProductById from "../../../application/use-cases/find-product-by-id";
import UpdateProduct from "../../../application/use-cases/update-product";
import DeleteProduct from "../../../application/use-cases/delete-product";

const router = express.Router();

const productRepository = createProductRepository();
const productController = new ProductController(
  new CreateProduct(productRepository),
  new ListAllProducts(productRepository),
  new FindProductById(productRepository),
  new UpdateProduct(productRepository),
  new DeleteProduct(productRepository)
);

router.post("/", (req, res) => productController.create(req, res));
router.get("/", (req, res) => productController.listAll(req, res));
router.get("/:id", (req, res) => productController.findById(req, res));
router.put("/:id", (req, res) => productController.update(req, res));
router.delete("/:id", (req, res) => productController.delete(req, res));

export default router;
