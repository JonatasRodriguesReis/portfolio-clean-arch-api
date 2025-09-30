import express from "express";
import {
  createOrderRepository,
  createProductRepository,
} from "../../../config/respository-factory";
import OrderController from "./controllers/order-controller";
import CreateOrder from "../../../application/use-cases/create-order";
import FindAllOrder from "../../../application/use-cases/find-all-orders";
import FindOrderById from "../../../application/use-cases/find-order-by-id";
import UpdateOrderStatus from "../../../application/use-cases/update-order-status";
import AddOrderItem from "../../../application/use-cases/add-order-item";
import RemoveOrderItem from "../../../application/use-cases/remove-order-item";
import DeleteOrder from "../../../application/use-cases/delete-order";

const router = express.Router();

const orderRepository = createOrderRepository();
const productRepository = createProductRepository();
const orderController = new OrderController(
  new CreateOrder(orderRepository, productRepository),
  new FindOrderById(orderRepository),
  new FindAllOrder(orderRepository),
  new UpdateOrderStatus(orderRepository),
  new AddOrderItem(orderRepository, productRepository),
  new RemoveOrderItem(orderRepository, productRepository),
  new DeleteOrder(orderRepository)
);

router.post("/", (req, res) => orderController.create(req, res));
router.get("/", (req, res) => orderController.listAll(req, res));
router.get("/:id", (req, res) => orderController.findById(req, res));
router.patch("/:id/status", (req, res) =>
  orderController.updateStatus(req, res)
);
router.post("/:id/items", (req, res) => orderController.addItem(req, res));
router.delete("/:id/items/:productId", (req, res) =>
  orderController.removeItem(req, res)
);
router.delete("/:id", (req, res) => orderController.delete(req, res));

export default router;
