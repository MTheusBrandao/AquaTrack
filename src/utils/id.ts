import { randomUUID } from 'expo-crypto';

/** UUIDs evitam conflito de ids quando houver sincronização com a nuvem. */
export function createId(): string {
  return randomUUID();
}
