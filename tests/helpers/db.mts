import { DatabaseSync } from 'node:sqlite';

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
      return raw.prepare(sql).run(...(params as never[]));
    },
    async getAllAsync(sql: string, ...params: unknown[]) {
      return raw.prepare(sql).all(...(params as never[]));
    },
    async getFirstAsync(sql: string, ...params: unknown[]) {
      return raw.prepare(sql).get(...(params as never[])) ?? null;
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
