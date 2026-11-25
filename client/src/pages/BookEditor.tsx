import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useRequest } from "../hooks/useRequest";
import { RequestState } from "../components/RequestState";
import { BookForm } from "../components/BookForm";
import type { BookDraft } from "../../../shared/book";
export function NewBook() {
  const navigate = useNavigate();
  async function save(draft: BookDraft) {
    const book = await api.save(draft);
    navigate(`/books/${book.id}`, { state: { message: "Книга добавлена." } });
  }
  return (
    <>
      <Link to="/books">← К списку</Link>
      <h1>Добавить книгу</h1>
      <BookForm onSave={save} />
    </>
  );
}
export function EditBook() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const load = useCallback((signal: AbortSignal) => api.get(id, signal), [id]);
  const state = useRequest(id, load);
  async function save(draft: BookDraft) {
    const book = await api.save(draft, id);
    navigate(`/books/${book.id}`, {
      state: { message: "Изменения сохранены." },
    });
  }
  return (
    <>
      <Link to={`/books/${id}`}>← К книге</Link>
      <h1>Редактировать книгу</h1>
      <RequestState {...state} />
      {state.data && <BookForm key={id} initial={state.data} onSave={save} />}
    </>
  );
}
