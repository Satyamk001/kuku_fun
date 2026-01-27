import express from "express";
import cors from "cors";
import { createRequire } from "module";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { clerkMiddleware } from "./config/clerk.js";
import { apiRouter } from "./routes/index.js";
import { env } from "./config/env.js";

const require = createRequire(import.meta.url);
const helmet = require("helmet");

const app = express();

app.use((req, _res, next) => {
  console.log("Incoming Request Origin:", req.headers.origin);
  console.log("Expected Frontend URL:", env.FRONTEND_URL);
  next();
});

app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(clerkMiddleware());

app.use(helmet());

app.use(express.json());
//health check
app.get("/health", (_req, res) => {
  res.json({ message: "ok" });
});
app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
