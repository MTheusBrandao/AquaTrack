const LOCALE = 'pt-BR';

export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return value.toLocaleString(LOCALE, { maximumFractionDigits });
}

/** Converte número para o texto exibido em campos de formulário (vírgula decimal). */
export function numberToInput(value: number | null): string {
  return value === null ? '' : String(value).replace('.', ',');
}

/** Aceita vírgula ou ponto como separador decimal. Retorna NaN para texto inválido. */
export function parseDecimal(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

/**
 * Datas de calendário (montagem, introdução) são guardadas como YYYY-MM-DD no fuso local.
 * Usar toISOString() aqui deslocaria o dia para quem está a oeste de UTC (ex.: Brasil à noite).
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatLocalDate(value: string): string {
  return parseLocalDate(value).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Instante ISO → "24 de nov. de 2026, 14:30" no fuso do aparelho. */
export function formatDateTime(isoInstant: string): string {
  return new Date(isoInstant).toLocaleString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(isoInstant: string): string {
  return new Date(isoInstant).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' });
}

/** "hoje", "ontem", "há 3 dias", "em 2 dias" — por dias de calendário locais. */
export function formatRelativeDay(isoInstant: string, now = new Date()): string {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(new Date(isoInstant)) - startOf(now)) / 86_400_000);
  if (diff === 0) return 'hoje';
  if (diff === -1) return 'ontem';
  if (diff === 1) return 'amanhã';
  return diff < 0 ? `há ${-diff} dias` : `em ${diff} dias`;
}

export function todayLocalDateString(): string {
  return toLocalDateString(new Date());
}
