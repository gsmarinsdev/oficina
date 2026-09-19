export type PeriodKey = 'hoje' | '7d' | '30d' | 'mes' | 'ano' | 'tudo' | 'custom';

// Datas em ISO (aaaa-mm-dd). `null` = sem limite naquele lado.
export type DateRange = { from: string | null; to: string | null };

export type Period = { key: PeriodKey; range: DateRange };

export const PRESETS: { key: Exclude<PeriodKey, 'custom'>; label: string }[] = [
  { key: 'hoje', label: 'Hoje' },
  { key: '7d', label: 'Últimos 7 dias' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: 'mes', label: 'Este mês' },
  { key: 'ano', label: 'Este ano' },
  { key: 'tudo', label: 'Tudo' },
];

// Usa a data local (não toISOString, que converte para UTC e pode virar o dia).
function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function rangeFor(key: Exclude<PeriodKey, 'custom'>): DateRange {
  const today = new Date();
  const to = toIso(today);
  switch (key) {
    case 'hoje':
      return { from: to, to };
    case '7d':
    case '30d': {
      const start = new Date(today);
      start.setDate(today.getDate() - (key === '7d' ? 6 : 29));
      return { from: toIso(start), to };
    }
    case 'mes':
      return { from: toIso(new Date(today.getFullYear(), today.getMonth(), 1)), to };
    case 'ano':
      return { from: toIso(new Date(today.getFullYear(), 0, 1)), to };
    case 'tudo':
      return { from: null, to: null };
  }
}

function br(iso: string): string {
  return iso.split('-').reverse().join('/');
}

export function describeRange({ from, to }: DateRange): string {
  if (from && to) return from === to ? br(from) : `${br(from)} a ${br(to)}`;
  if (from) return `a partir de ${br(from)}`;
  if (to) return `até ${br(to)}`;
  return 'todo o período';
}
