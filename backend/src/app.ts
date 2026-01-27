import express from "express";
import cors from "cors";
import { createRequire } from "module";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { clerkMiddleware } from "./config/clerk.js";
import { apiRouter } from "./routes/index.js";

const require = createRequire(import.meta.url);
const helmet = require("helmet");

export function createApp() {
  const app = express();

  app.use(clerkMiddleware());

  app.use(helmet());

  app.use(
    cors({
      origin: [process.env.FRONTEND_URL || "*"],
      credentials: true,
    })
  );

  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
