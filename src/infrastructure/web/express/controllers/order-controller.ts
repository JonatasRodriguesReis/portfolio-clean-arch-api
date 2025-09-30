import AddOrderItem from "../../../../application/use-cases/add-order-item";
import CreateOrder from "../../../../application/use-cases/create-order";
import DeleteOrder from "../../../../application/use-cases/delete-order";
import FindAllOrder from "../../../../application/use-cases/find-all-orders";
import FindOrderById from "../../../../application/use-cases/find-order-by-id";
import RemoveOrderItem from "../../../../application/use-cases/remove-order-item";
import UpdateOrderStatus from "../../../../application/use-cases/update-order-status";

export default class OrderController {
  constructor(
    private createOrder: CreateOrder,
    private findOrderById: FindOrderById,
    private listAllOrders: FindAllOrder,
    private updateOrderStatus: UpdateOrderStatus,
    private addOrderItem: AddOrderItem,
    private removeOrderItem: RemoveOrderItem,
    private removeOrder: DeleteOrder
  ) {}

  async create(req: any, res: any) {
    try {
      console.log("Create order request body:", req.body);
      const { products } = req.body;
      const order = await this.createOrder.execute(products);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findById(req: any, res: any) {
    try {
      const { id } = req.params;
      const order = await this.findOrderById.execute(id);
      res.status(200).json(order);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  async listAll(req: any, res: any) {
    try {
      const orders = await this.listAllOrders.execute();
      res.status(200).json(orders);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateStatus(req: any, res: any) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.updateOrderStatus.execute(id, status);
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async addItem(req: any, res: any) {
    try {
      const { id } = req.params;
      const { productId, quantity } = req.body;
      const order = await this.addOrderItem.execute(id, productId, quantity);
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async removeItem(req: any, res: any) {
    try {
      const { id, productId } = req.params;
      const order = await this.removeOrderItem.execute(id, productId);
      res.status(200).json(order);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: any, res: any) {
    try {
      const { id } = req.params;
      await this.removeOrder.execute(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
