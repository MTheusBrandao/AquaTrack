import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState } from 'react';

type QueryState<T> = {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  reload: () => void;
};

/**
 * Executa uma consulta ao banco sempre que a tela ganha foco,
 * para refletir alterações feitas em outras telas sem estado global.
 * `query` deve ser estável (função de módulo ou useCallback).
 */
export function useFocusQuery<T>(query: (db: SQLiteDatabase) => Promise<T>): QueryState<T> {
  const db = useSQLiteContext();
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      query(db)
        .then((result) => {
          if (!active) return;
          setData(result);
          setError(null);
        })
        .catch((cause: unknown) => {
          if (active) setError(cause instanceof Error ? cause : new Error(String(cause)));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [db, query, reloadKey]),
  );

  const reload = useCallback(() => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return { data, loading, error, reload };
}
