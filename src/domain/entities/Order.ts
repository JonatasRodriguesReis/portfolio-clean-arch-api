import Product from "./Product";

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  CANCELLED = "CANCELLED",
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export default class Order {
  private id: string;
  private items: OrderItem[];
  private createdAt: Date;
  private updatedAt: Date;
  private status: OrderStatus;
  constructor(id: string) {
    this.id = id;
    this.items = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.status = OrderStatus.PENDING;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getOrderItems(): OrderItem[] {
    return this.items;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getStatus(): string {
    return this.status;
  }

  getTotalPrice(): number {
    return this.items.reduce(
      (total, productItem) =>
        total + productItem.product.getPrice() * productItem.quantity,
      0
    );
  }

  // Setters
  setStatus(status: OrderStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  setUpdatedAt(date: Date): void {
    this.updatedAt = date;
  }

  setCreatedAt(date: Date): void {
    this.createdAt = date;
  }

  // Methods

  addProduct(product: Product, quantity: number): void {
    this.items.push({
      product,
      quantity,
    });
    this.updatedAt = new Date();
  }

  removeProduct(product: Product): void {
    this.items = this.items.filter(
      (item) => item.product.getId() !== product.getId()
    );
    this.updatedAt = new Date();
  }

  // To JSON
  toJSON() {
    return {
      id: this.id,
      items: this.items.map((item) => ({
        product: item.product.toJSON(),
        quantity: item.quantity,
      })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
      totalPrice: this.getTotalPrice(),
    };
  }

  static fromJSON(json: any): Order {
    const order = new Order(json.id);
    order.items = json.items.map((item: any) => ({
      product: Product.fromJSON(item.product),
      quantity: item.quantity,
    }));
    order.createdAt = new Date(json.createdAt);
    order.updatedAt = new Date(json.updatedAt);
    order.status = json.status;
    return order;
  }
}
