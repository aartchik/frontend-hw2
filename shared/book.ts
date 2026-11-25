export const statuses = {
  planned: "Хочу прочитать",
  reading: "Читаю",
  finished: "Прочитано",
} as const;
export type Status = keyof typeof statuses;
export interface Book {
  id: string;
  title: string;
  author: string;
  status: Status;
  note: string;
}
export type BookDraft = Omit<Book, "id">;
export interface BookQuery {
  q?: string;
  status?: Status;
}
export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && Object.hasOwn(statuses, value);
}
export function validateDraft(value: unknown): value is BookDraft {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.title === "string" &&
    b.title.trim().length > 0 &&
    b.title.length <= 120 &&
    typeof b.author === "string" &&
    b.author.trim().length > 0 &&
    b.author.length <= 120 &&
    isStatus(b.status) &&
    typeof b.note === "string" &&
    b.note.length <= 500
  );
}
export const demoBooks: Book[] = [
  {
    id: "1",
    title: "Маленький принц",
    author: "Антуан де Сент-Экзюпери",
    status: "finished",
    note: "Книга о дружбе и ответственности.",
  },
  {
    id: "2",
    title: "Норвежский лес",
    author: "Харуки Мураками",
    status: "reading",
    note: "Читаю по вечерам.",
  },
  {
    id: "3",
    title: "Вино из одуванчиков",
    author: "Рэй Брэдбери",
    status: "planned",
    note: "Хочу прочитать летом.",
  },
  {
    id: "4",
    title: "Цветы для Элджернона",
    author: "Дэниел Киз",
    status: "finished",
    note: "",
  },
];
