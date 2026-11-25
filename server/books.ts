import { Router } from "express";
import { randomUUID } from "node:crypto";
import { demoBooks, isStatus, validateDraft } from "../shared/book";
import type { Book } from "../shared/book";
export function booksRouter(initial: Book[] = demoBooks) {
  const router = Router();
  let books = structuredClone(initial);
  router.get("/", (req, res) => {
    const { q, status } = req.query;
    if (Object.keys(req.query).some((key) => key !== "q" && key !== "status")) {
      res.status(400).json({ message: "Неизвестный параметр поиска." });
      return;
    }
    if (
      (q !== undefined && (typeof q !== "string" || q.length > 200)) ||
      (status !== undefined && !isStatus(status))
    ) {
      res.status(400).json({ message: "Некорректные параметры поиска." });
      return;
    }
    const query = typeof q === "string" ? q.trim().toLocaleLowerCase("ru") : "";
    res.json(
      books.filter(
        (b) =>
          (!status || b.status === status) &&
          `${b.title} ${b.author}`.toLocaleLowerCase("ru").includes(query),
      ),
    );
  });
  router.get("/:id", (req, res) => {
    const book = books.find((b) => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ message: "Книга не найдена." });
      return;
    }
    res.json(book);
  });
  router.post("/", (req, res) => {
    if (!validateDraft(req.body)) {
      res
        .status(400)
        .json({
          message:
            "Укажите название и автора (до 120 символов), статус и заметку (до 500 символов).",
        });
      return;
    }
    const { title, author, status, note } = req.body;
    const book: Book = {
      id: randomUUID(),
      title: title.trim(),
      author: author.trim(),
      status,
      note: note.trim(),
    };
    books = [book, ...books];
    res.status(201).location(`/api/books/${book.id}`).json(book);
  });
  router.put("/:id", (req, res) => {
    if (!books.some((b) => b.id === req.params.id)) {
      res.status(404).json({ message: "Книга не найдена." });
      return;
    }
    if (!validateDraft(req.body)) {
      res
        .status(400)
        .json({
          message: "Проверьте название, автора, статус и длину заметки.",
        });
      return;
    }
    const { title, author, status, note } = req.body;
    const book: Book = {
      id: req.params.id,
      title: title.trim(),
      author: author.trim(),
      status,
      note: note.trim(),
    };
    books = books.map((b) => (b.id === book.id ? book : b));
    res.json(book);
  });
  router.delete("/:id", (req, res) => {
    if (!books.some((b) => b.id === req.params.id)) {
      res.status(404).json({ message: "Книга не найдена." });
      return;
    }
    books = books.filter((b) => b.id !== req.params.id);
    res.sendStatus(204);
  });
  return router;
}
