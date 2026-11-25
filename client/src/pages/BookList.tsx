import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useRequest } from "../hooks/useRequest";
import { RequestState } from "../components/RequestState";
import { statuses, isStatus } from "../../../shared/book";
export function BookList() {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const load = useCallback(
    (signal: AbortSignal) => api.list(query, signal),
    [query],
  );
  const state = useRequest(query, load);
  function update(key: string, value: string) {
    setParams(
      () => {
        const next = new URLSearchParams(window.location.search);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  const status = params.get("status") ?? "";
  return (
    <>
      <div className="heading">
        <h1>Моя библиотека</h1>
        <Link to="/books/new">Добавить книгу</Link>
      </div>
      <div className="filters">
        <label>
          Поиск
          <input
            aria-label="Поиск"
            maxLength={200}
            value={params.get("q") ?? ""}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Название или автор"
          />
        </label>
        <label>
          Статус
          <select
            value={isStatus(status) ? status : ""}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="">Все книги</option>
            {Object.entries(statuses).map(([key, text]) => (
              <option key={key} value={key}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => setParams({})}>Сбросить</button>
      </div>
      <RequestState {...state} />
      {state.data && (
        <>
          {state.data.length === 0 ? (
            <p>Книги не найдены. Измените фильтры или добавьте книгу.</p>
          ) : (
            <>
              <p>Найдено книг: {state.data.length}</p>
              <div className="books">
                {state.data.map((book) => (
                  <article key={book.id}>
                    <h2>
                      <Link to={`/books/${book.id}`}>{book.title}</Link>
                    </h2>
                    <p>{book.author}</p>
                    <span>{statuses[book.status]}</span>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
