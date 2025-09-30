export default class Product {
  private id: string;
  private name: string;
  private price: number;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    name: string,
    price: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getPrice(): number {
    return this.price;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Setters
  changeName(name: string) {
    this.name = name;
    this.updatedAt = new Date();
  }

  changePrice(price: number) {
    if (price < 0) {
      throw new Error("Price cannot be negative");
    }
    this.price = price;
    this.updatedAt = new Date();
  }

  // To JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json: any): Product {
    return new Product(
      json.id,
      json.name,
      json.price,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}
