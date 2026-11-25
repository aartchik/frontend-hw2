import type { Book, BookDraft } from "../../shared/book";
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("Нет связи с сервером. Попробуйте ещё раз.");
  }
  if (!response.ok) {
    let message = `Ошибка запроса (${response.status}).`;
    try {
      const data: unknown = await response.json();
      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
      )
        message = data.message;
    } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const api = {
  list: (query: string, signal: AbortSignal) =>
    request<Book[]>(`/api/books${query ? `?${query}` : ""}`, { signal }),
  get: (id: string, signal: AbortSignal) =>
    request<Book>(`/api/books/${encodeURIComponent(id)}`, { signal }),
  save: (draft: BookDraft, id?: string) =>
    request<Book>(id ? `/api/books/${encodeURIComponent(id)}` : "/api/books", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    }),
  remove: (id: string) =>
    request<void>(`/api/books/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
