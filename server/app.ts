import express from "express";
import type { ErrorRequestHandler } from "express";
import path from "node:path";
import { booksRouter } from "./books";
import type { Book } from "../shared/book";
export function createApp(initial?: Book[]) {
  const app = express();
  app.use(express.json({ limit: "32kb" }));
  app.use("/api/books", booksRouter(initial));
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "Маршрут API не найден." }),
  );
  app.use(express.static(path.resolve("dist")));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.resolve("dist/index.html")),
  );
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    const status =
      error.type === "entity.too.large"
        ? 413
        : error instanceof SyntaxError
          ? 400
          : 500;
    res
      .status(status)
      .json({
        message:
          status === 400
            ? "Некорректный JSON."
            : status === 413
              ? "Слишком большой запрос."
              : "Не удалось выполнить запрос.",
      });
  };
  app.use(errors);
  return app;
}
