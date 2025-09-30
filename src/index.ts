import express from "express";
import productRouter from "./infrastructure/web/express/product-routes";
import orderRouter from "./infrastructure/web/express/order-routes";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

//enble CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/products", productRouter);
app.use("/orders", orderRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
