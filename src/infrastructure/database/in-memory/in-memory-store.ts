import Order from "../../../domain/entities/Order";
import Product from "../../../domain/entities/Product";

export const inMemoryStore = {
  products: [] as Product[],
  orders: [] as Order[],
  reset() {
    this.products = [] as Product[];
    this.orders = [] as Order[];
  },
};
