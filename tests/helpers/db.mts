import { DatabaseSync } from 'node:sqlite';

/** expo-sqlite aceita parâmetros variádicos ou um único array; o node:sqlite só variádicos. */
function bind(params: unknown[]): never[] {
  return (params.length === 1 && Array.isArray(params[0]) ? params[0] : params) as never[];
}

/**
 * Implementa o subconjunto da API do expo-sqlite usado pelo app sobre o SQLite do Node,
 * para rodar migrations, repositories e services reais sem celular.
 */
export function createTestDatabase() {
  const raw = new DatabaseSync(':memory:');
  const db = {
    async execAsync(sql: string) {
      raw.exec(sql);
    },
    async runAsync(sql: string, ...params: unknown[]) {
      return raw.prepare(sql).run(...bind(params));
    },
    async getAllAsync(sql: string, ...params: unknown[]) {
      return raw.prepare(sql).all(...bind(params));
    },
    async getFirstAsync(sql: string, ...params: unknown[]) {
      return raw.prepare(sql).get(...bind(params)) ?? null;
    },
    async withTransactionAsync(task: () => Promise<void>) {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return { raw, db: db as never };
}
