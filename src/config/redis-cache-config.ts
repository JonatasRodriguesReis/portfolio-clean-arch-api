import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";

export const redisClient = createClient({
  socket: {
    host: redisHost,
    port: parseInt(redisPort, 10),
  },
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});
