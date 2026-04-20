import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { notFoundMiddleware } from "./middlewares/notFoundMiddleware.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [env.FRONTEND_URL],
      credentials: true
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}