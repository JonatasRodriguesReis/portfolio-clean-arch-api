# 🏗️ Clean Architecture API – Orders & Products

This project is a **TypeScript-based REST API** for managing **Products** and **Orders**, built with **Clean Architecture** principles to ensure testability, maintainability, and the ability to switch databases easily (MySQL, in-memory, or other implementations).

---

## 📂 Project Structure

```
src/
├── domain/              # Entities + Repository Interfaces
│   ├── entities/
│   │   ├── Product.ts
│   │   └── Order.ts
│   └── repositories/
│       ├── IProductRepository.ts
│       └── IOrderRepository.ts
|       └── ICacheRepository.ts
│
├── application/         # Use Cases (Business Logic)
│   ├── use-cases/
│   │   ├── add-order-item.ts
│   │   ├── create-order.ts
│   │   ├── create-product.ts
│   │   └── delete-order.ts
|   |   └── delete-product.ts
|   |   ...
│   └──
│
├── infrastructure/      # Database Implementation Details
│   ├── database/
│   │   ├── mysql/
│   │   │   ├── order-repository-mysql.ts
│   │   │   └── product-repository-mysql.ts
│   │   └── in-memory/
│   │       ├── order-repository-in-memory.ts
│   │       └── product-repository-in-memory.ts
│   │
│   ├── cache/           # Cache Implementation Details
│   │   ├── redis-cache.ts
│   │
│   └── web/
│       └── express/
│           ├── order-routes.ts
|           ├── product-routes.ts
│           └── controllers/
│               ├── product-controller.ts
│               └── order-controller.ts
│
└── config/
    └── repository-factory.ts
```

---

## 🏛️ Domain Layer

The **Domain Layer** contains:

- **Entities:** Plain classes representing core business concepts (e.g., `Product`, `Order`).
- **Repository Interfaces:** Define contracts for persistence (`ProductRepository`, `OrderRepository`).  
  These interfaces are **database-agnostic** and make testing and switching databases easy.

Example `ProductRepository` interface:

```ts
export interface ProductRepository {
  save(product: Product): Promise<void>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
}
```

---

## 📦 Application Layer

The **Application Layer** contains:

- **Use Cases:** Contain the business rules for the system.  
  Example use cases:
  - `CreateProduct`
  - `ListProducts`
  - `CreateOrder`
  - `UpdateOrderStatus`
- **Dependency Injection:** Each use case receives the required repositories and cache services in its constructor.
- **Cache Strategies:**
  - **Read-Through Cache:** When fetching data, check cache first → if not found, query DB → store in cache.
  - **Write-Through Cache:** When saving data, update DB and immediately update cache.

This keeps all **business logic independent** from frameworks and databases.

---

## 🛠️ Infrastructure Layer

The **Infrastructure Layer** provides concrete implementations of the abstractions defined in the Domain Layer.

- **Database Repositories:**
  - `ProductRepositoryMySQL`, `OrderRepositoryMysql`
  - `ProductRepositoryInMemory`, `OrderRepositoryInMemory`
- **Cache Implementations:**
  - `RedisCache` (production)
  - `InMemoryCache` (development/testing)

These implementations follow the repository interfaces, so switching between **MySQL** and **In-Memory** is just a matter of changing the `DB_TYPE` environment variable.

---

## 🌐 Web Layer (Express)

- **Routes:** Define HTTP endpoints (`/products`, `/orders`).
- **Controllers:** Receive requests, call the corresponding use case, and return HTTP responses.
- **Dependency Injection:**  
  Controllers do not know about the database or cache directly — they only receive services (use cases).  
  Each service internally uses a **Repository Factory**, which:

  - Selects the appropriate **database repository** implementation (`MySQLRepository` or `InMemoryRepository`) based on the `DB_TYPE` environment variable.
  - Wraps the selected repository with a **cache repository**, enabling **read-through** and **write-through** caching strategies automatically.

  This design ensures:

  - Controllers remain decoupled from infrastructure details.
  - Switching databases (or adding a new one) requires no change in the controller layer — only the factory logic.
  - Cache integration is transparent to services and controllers.

## 📌 API Routes

The API exposes two main resources: **Orders** and **Products**.  
Each resource has its own set of endpoints managed by controllers.

### 🛒 Order Routes (`/orders`)

- `POST /orders` → Create a new order
- `GET /orders` → List all orders
- `GET /orders/:id` → Get an order by ID
- `PATCH /orders/:id/status` → Update the status of an order
- `POST /orders/:id/items` → Add a product item to an order
- `DELETE /orders/:id/items/:productId` → Remove a product item from an order
- `DELETE /orders/:id` → Delete an order

### 📦 Product Routes (`/products`)

- `POST /products` → Create a new product
- `GET /products` → List all products
- `GET /products/:id` → Get a product by ID
- `PUT /products/:id` → Update a product
- `DELETE /products/:id` → Delete a product

---

## ⚙️ Database Switching

Repository implementations are chosen dynamically at runtime using an environment variable:

```env
DB_TYPE=mysql  # Options: mysql | memory
```

Example factory:

```ts
export function createProductRepository(): any {
  switch (process.env.DB_TYPE) {
    case "mysql":
      return new ProductRepositoryMysql(new RedisCache());
    default:
      return new ProductRepositoryInMemory(new InMemoryCache());
  }
}
```

---

## 💾 Caching Strategy

Both **Product** and **Order** repositories support caching through a `CacheRepository`:

- **Read-Through:**
  - On `findAll()` or `findById()`, check cache first.
  - If not present, query DB and populate cache.
- **Write-Through:**
  - On `save()` or `update()`, persist to DB **and** update cache immediately.

This improves performance while keeping cache logic centralized in repositories.

---

## 🚀 How It Works

1. **Request:** Client sends an HTTP request to `/products` or `/orders`.
2. **Controller:** Routes forward request to the controller.
3. **Use Case:** Controller calls a use case (e.g., `CreateOrder`) with data from request.
4. **Repository:** Use case calls repository to read/write data (and cache if configured).
5. **Response:** Result is returned to controller → sent back as JSON.

---

## 🧪 Benefits of This Architecture

- ✅ **Easily switch databases** (MySQL ↔ In-Memory)
- ✅ **SOLID principles** applied (Single Responsibility, Dependency Inversion)
- ✅ **Testable** (use cases can be tested with mock repositories)
- ✅ **Scalable** (add new databases, caching strategies, or message queues without breaking business logic)
- ✅ **Separation of concerns** (web, business, and infrastructure layers are independent)

---

## 🔧 Tech Stack

- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MySQL / In-Memory
- **Cache:** Redis / In-Memory
- **Architecture:** Clean Architecture + SOLID
- **Testing:** Jest (optional)

---

## 🏃‍♂️ Getting Started

**Start the api with the infrastructure services (MySQL + Redis):**

```bash
   docker compose up -d
```

---

## 📖 Future Improvements

- Add authentication & authorization (JWT)
- Add pagination & filtering
- Add message queues for async processing
- Add GraphQL support
