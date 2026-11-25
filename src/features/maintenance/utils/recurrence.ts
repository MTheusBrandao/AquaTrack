import type { Frequency, MaintenanceStatus } from '../types/maintenance';

type RecurringFrequency = Exclude<Frequency, 'once'>;

const DAY_STEPS: Record<Exclude<RecurringFrequency, 'monthly'>, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * k-ésima ocorrência a partir da âncora, no calendário LOCAL.
 * Somar dias com setDate (e não milissegundos) mantém o horário de parede mesmo com
 * horário de verão; meses curtos limitam o dia (31/01 → 28/02 → 31/03).
 */
export function occurrenceAt(anchor: Date, frequency: RecurringFrequency, k: number): Date {
  if (frequency === 'monthly') {
    const totalMonths = anchor.getMonth() + k;
    const year = anchor.getFullYear() + Math.floor(totalMonths / 12);
    const month = ((totalMonths % 12) + 12) % 12;
    const day = Math.min(anchor.getDate(), daysInMonth(year, month));
    return new Date(
      year,
      month,
      day,
      anchor.getHours(),
      anchor.getMinutes(),
      anchor.getSeconds(),
      anchor.getMilliseconds(),
    );
  }

  const result = new Date(anchor);
  result.setDate(anchor.getDate() + DAY_STEPS[frequency] * k);
  return result;
}

/** Primeira ocorrência estritamente posterior a `after`. */
export function nextOccurrence(anchor: Date, frequency: RecurringFrequency, after: Date): Date {
  let k: number;
  if (frequency === 'monthly') {
    k =
      (after.getFullYear() - anchor.getFullYear()) * 12 + (after.getMonth() - anchor.getMonth()) - 1;
  } else {
    k = Math.floor((after.getTime() - anchor.getTime()) / (DAY_STEPS[frequency] * MS_PER_DAY)) - 1;
  }
  k = Math.max(k, 0);

  // A estimativa fica no máximo uma ou duas ocorrências antes; o laço ajusta.
  let candidate = occurrenceAt(anchor, frequency, k);
  while (candidate.getTime() <= after.getTime()) {
    k += 1;
    candidate = occurrenceAt(anchor, frequency, k);
  }
  return candidate;
}

/**
 * Próxima execução depois de concluir a ocorrência atual.
 * Concluída antes do prazo: vai para a ocorrência seguinte à atual.
 * Concluída com atraso: pula as ocorrências perdidas e vai para a próxima futura.
 */
export function nextAfterCompletion(
  anchor: Date,
  frequency: RecurringFrequency,
  currentScheduled: Date,
  completedAt: Date,
): Date {
  const after = completedAt > currentScheduled ? completedAt : currentScheduled;
  return nextOccurrence(anchor, frequency, after);
}

export function getMaintenanceStatus(
  task: { scheduledAt: string; completedAt: string | null },
  now: Date,
): MaintenanceStatus {
  if (task.completedAt) return 'completed';
  return new Date(task.scheduledAt).getTime() < now.getTime() ? 'overdue' : 'pending';
}
