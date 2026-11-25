import { useEffect, useState } from "react";
type Result<T> = {
  key: string;
  loading: boolean;
  data: T | null;
  error: string;
};
export function useRequest<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T>>({
    key,
    loading: true,
    data: null,
    error: "",
  });
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setResult({ key, loading: true, data: null, error: "" });
    async function run() {
      try {
        const data = await load(controller.signal);
        if (current) setResult({ key, loading: false, data, error: "" });
      } catch (error) {
        if (current && !controller.signal.aborted)
          setResult({
            key,
            loading: false,
            data: null,
            error:
              error instanceof Error ? error.message : "Неизвестная ошибка.",
          });
      }
    }
    void run();
    return () => {
      current = false;
      controller.abort();
    };
  }, [key, load, attempt]);
  return {
    ...(result.key === key
      ? result
      : { key, loading: true, data: null, error: "" }),
    retry: () => setAttempt((n) => n + 1),
  };
}
