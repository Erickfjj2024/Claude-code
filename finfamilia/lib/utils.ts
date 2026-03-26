import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formats a number as Brazilian Real currency.
 * e.g. 1500.5 → "R$ 1.500,50"
 */
export function fmt(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Short format for large values.
 * e.g. 1500000 → "R$ 1,5M" | 15000 → "R$ 15K"
 */
export function fmtShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (abs >= 1_000) {
    return `${sign}R$ ${(abs / 1_000).toFixed(1).replace('.', ',')}K`;
  }
  return fmt(value);
}

/**
 * Format a date string or Date object for display.
 * Today/Yesterday shorthand, otherwise dd/MM/yyyy.
 */
export function fmtDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';

  return format(d, "dd 'de' MMMM", { locale: ptBR });
}

/**
 * Full date format: "26 de março de 2026"
 */
export function fmtDateFull(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Month/year format: "Março 2026"
 */
export function fmtMonth(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "MMMM yyyy", { locale: ptBR });
}

/**
 * Relative time: "há 3 dias", "em 2 horas"
 */
export function fmtRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

/**
 * Dynamic greeting based on current hour.
 */
export function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Calculate percentage: (a / b) * 100
 */
export function pct(a: number, b: number): number {
  if (b === 0) return 0;
  return Math.round((a / b) * 100 * 10) / 10;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns color for budget progress (green/yellow/red).
 */
export function budgetColor(spent: number, limit: number): string {
  const ratio = limit > 0 ? spent / limit : 0;
  if (ratio >= 1) return '#FF4D6A';
  if (ratio >= 0.75) return '#FF9F43';
  return '#00D4AA';
}

/**
 * Format a percentage variation with sign.
 * e.g. 3.5 → "+3,5%" | -2 → "-2,0%"
 */
export function fmtVariation(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1).replace('.', ',')}%`;
}

/**
 * Returns initials from a name (max 2 chars).
 */
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
