interface Props {
  loading: boolean;
  error: string;
  retry: () => void;
}
export function RequestState({ loading, error, retry }: Props) {
  if (loading) return <p role="status">Загрузка…</p>;
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={retry}>Повторить запрос</button>
      </div>
    );
  return null;
}
