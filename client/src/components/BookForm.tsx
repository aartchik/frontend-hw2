import { useState } from "react";
import type { FormEvent } from "react";
import { statuses, validateDraft } from "../../../shared/book";
import type { BookDraft, Status } from "../../../shared/book";
interface Props {
  initial?: BookDraft;
  onSave: (draft: BookDraft) => Promise<void>;
}
export function BookForm({ initial, onSave }: Props) {
  const [draft, setDraft] = useState<BookDraft>(
    initial ?? { title: "", author: "", status: "planned", note: "" },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!validateDraft(draft)) {
      setError("Введите название и автора.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить книгу.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={saving}>
        <label>
          Название
          <input
            required
            maxLength={120}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <label>
          Автор
          <input
            required
            maxLength={120}
            value={draft.author}
            onChange={(e) => setDraft({ ...draft, author: e.target.value })}
          />
        </label>
        <label>
          Статус
          <select
            value={draft.status}
            onChange={(e) =>
              setDraft({ ...draft, status: e.target.value as Status })
            }
          >
            {Object.entries(statuses).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Заметка
          <textarea
            maxLength={500}
            rows={4}
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
        </label>
        <button type="submit">{saving ? "Сохранение…" : "Сохранить"}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
