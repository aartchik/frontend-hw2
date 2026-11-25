import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useRequest } from "../hooks/useRequest";
import { RequestState } from "../components/RequestState";
import { statuses } from "../../../shared/book";
export function BookDetails() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const load = useCallback((signal: AbortSignal) => api.get(id, signal), [id]);
  const state = useRequest(id, load);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      await api.remove(id);
      navigate("/books", { state: { message: "Книга удалена." } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить книгу.");
      setDeleting(false);
    }
  }
  return (
    <>
      <Link to="/books">← К списку</Link>
      <RequestState {...state} />
      {state.data && (
        <>
          <h1>{state.data.title}</h1>
          <p>Автор: {state.data.author}</p>
          <p>Статус: {statuses[state.data.status]}</p>
          <p className="note">{state.data.note || "Без заметки"}</p>
          <div className="actions">
            <Link to={`/books/${id}/edit`}>Редактировать</Link>
            <button onClick={() => setConfirm(true)}>Удалить</button>
          </div>
          {confirm && (
            <section aria-label="Подтверждение удаления">
              <p>Удалить книгу «{state.data.title}»?</p>
              <button disabled={deleting} onClick={() => void remove()}>
                {deleting ? "Удаление…" : "Да, удалить"}
              </button>{" "}
              <button disabled={deleting} onClick={() => setConfirm(false)}>
                Отмена
              </button>
            </section>
          )}
          {error && <p role="alert">{error}</p>}
        </>
      )}
    </>
  );
}
