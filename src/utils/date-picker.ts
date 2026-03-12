export type DateRange = [Date, Date] | null;
export type DateMarker = {
  date: Date | string;
  type?: string;
  tooltip?: Array<{ text: string; color?: string }>;
};

export const normalizeDate = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const toDateKey = (date: Date): string => {
  const d = normalizeDate(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const toDate = (value?: Date | string | null): Date | null => {
  if (!value) {
    return null;
  }
  const d = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return normalizeDate(d);
};

export const getMonthStart = (date: Date): Date => {
  const d = normalizeDate(date);
  d.setDate(1);
  return d;
};

export const addMonths = (date: Date, diff: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + diff);
  return getMonthStart(d);
};

export const isSameDay = (a: Date | null, b: Date | null): boolean => {
  if (!a || !b) {
    return false;
  }
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
};

export const isInRange = (value: Date, start: Date | null, end: Date | null): boolean => {
  if (!start || !end) {
    return false;
  }
  const ts = value.getTime();
  return ts >= start.getTime() && ts <= end.getTime();
};

export const formatDateByPattern = (date: Date, pattern: string, locale: string): string => {
  const normalized = normalizeDate(date);
  const dd = String(normalized.getDate()).padStart(2, '0');
  const yyyy = String(normalized.getFullYear());
  const MMMM = new Intl.DateTimeFormat(locale, { month: 'long' }).format(normalized);
  return pattern
    .replace('dd', dd)
    .replace('MMMM', MMMM)
    .replace('yyyy', yyyy);
};

export const buildMarkerSet = (
  markers: DateMarker[] | undefined,
  today = new Date(),
): Set<string> => {
  const set = new Set<string>();
  const todayDate = normalizeDate(today);
  set.add(toDateKey(todayDate));
  for (const marker of markers || []) {
    const markerDate = toDate(marker?.date ?? null);
    if (markerDate) {
      set.add(toDateKey(markerDate));
    }
  }
  return set;
};
