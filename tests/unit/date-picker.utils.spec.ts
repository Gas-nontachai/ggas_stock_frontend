import {
  addMonths,
  buildMarkerSet,
  formatDateByPattern,
  getMonthStart,
  isInRange,
  isSameDay,
  normalizeDate,
  toDate,
} from '@/utils/date-picker';

describe('date-picker utils', () => {
  it('normalizes date to start of day', () => {
    const value = normalizeDate(new Date('2026-03-13T14:23:11.000Z'));
    expect(value.getHours()).toBe(0);
    expect(value.getMinutes()).toBe(0);
    expect(value.getSeconds()).toBe(0);
    expect(value.getMilliseconds()).toBe(0);
  });

  it('parses valid values and rejects invalid values', () => {
    expect(toDate('2026-03-13') instanceof Date).toBe(true);
    expect(toDate(new Date('2026-03-13')) instanceof Date).toBe(true);
    expect(toDate('not-a-date')).toBeNull();
    expect(toDate(null)).toBeNull();
  });

  it('gets month start and moves month', () => {
    const monthStart = getMonthStart(new Date('2026-03-19'));
    expect(monthStart.getDate()).toBe(1);

    const prevMonth = addMonths(monthStart, -1);
    expect(prevMonth.getMonth()).toBe(1);
  });

  it('checks day equality and range inclusion', () => {
    const a = toDate('2026-03-13')!;
    const b = toDate('2026-03-13')!;
    const c = toDate('2026-03-14')!;
    expect(isSameDay(a, b)).toBe(true);
    expect(isSameDay(a, c)).toBe(false);

    const start = toDate('2026-03-10');
    const end = toDate('2026-03-15');
    expect(isInRange(toDate('2026-03-12')!, start, end)).toBe(true);
    expect(isInRange(toDate('2026-03-16')!, start, end)).toBe(false);
  });

  it('formats selected text with locale and pattern', () => {
    const text = formatDateByPattern(toDate('2026-03-13')!, 'dd MMMM yyyy', 'en');
    expect(text).toContain('13');
    expect(text).toContain('2026');
  });

  it('builds marker set including today and valid markers only', () => {
    const set = buildMarkerSet(
      [
        { date: '2026-03-10' },
        { date: 'invalid' },
      ],
      new Date('2026-03-13'),
    );

    expect(set.has('2026-03-13')).toBe(true);
    expect(set.has('2026-03-10')).toBe(true);
    expect(set.has('invalid')).toBe(false);
  });
});
