import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

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
 *
 * `reload` chama a consulta diretamente. Não usar um "contador de recarga" como dependência
 * do efeito: o React Compiler descarta dependências que o corpo da função não lê, e a
 * recarga deixaria de acontecer.
 */
export function useFocusQuery<T>(query: (db: SQLiteDatabase) => Promise<T>): QueryState<T> {
  const db = useSQLiteContext();
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Só a resposta da consulta mais recente é aplicada (evita resultado antigo sobrescrever o novo).
  const latestRequest = useRef(0);

  const run = useCallback(() => {
    const requestId = ++latestRequest.current;
    const isCurrent = () => requestId === latestRequest.current;

    query(db)
      .then((result) => {
        if (!isCurrent()) return;
        setData(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (isCurrent()) setError(cause instanceof Error ? cause : new Error(String(cause)));
      })
      .finally(() => {
        if (isCurrent()) setLoading(false);
      });
  }, [db, query]);

  useFocusEffect(
    useCallback(() => {
      run();
      return () => {
        // Invalida a consulta em andamento ao perder o foco.
        latestRequest.current += 1;
      };
    }, [run]),
  );

  const reload = useCallback(() => {
    setLoading(true);
    run();
  }, [run]);

  return { data, loading, error, reload };
}
