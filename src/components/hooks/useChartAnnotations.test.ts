import { renderHook } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { useChartAnnotations } from './useChartAnnotations';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  query: vi.fn(),
  dateRange: {
    startDate: new Date(2026, 2, 1),
    endDate: new Date(2026, 2, 31, 23, 59, 59, 999),
  },
}));

vi.mock('./queries/useWebsiteAnnotationsQuery', () => ({
  useWebsiteAnnotationsQuery: (...args: unknown[]) => mocks.query(...args),
}));
vi.mock('./useDateParameters', () => ({
  useDateParameters: () => ({ startAt: 1000, endAt: 2000 }),
}));
vi.mock('./useDateRange', () => ({ useDateRange: () => ({ dateRange: mocks.dateRange }) }));
vi.mock('./useNavigation', () => ({
  useNavigation: () => ({
    router: { push: mocks.push },
    updateParams: (params: Record<string, unknown>) => params,
  }),
}));
vi.mock('./useTimezone', () => ({
  useTimezone: () => ({ timezone: 'UTC', fromUtc: (date: Date) => date }),
}));

const allDay = {
  id: 'a',
  date: new Date(2026, 2, 10, 15).toISOString(),
  note: 'Launch',
  allDay: true,
};
const timed = {
  id: 'b',
  date: new Date(2026, 2, 12, 9).toISOString(),
  note: 'Deploy',
  allDay: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.mockReturnValue({ data: { data: [allDay, timed] } });
});

test('loads annotations for the global date range', () => {
  renderHook(() => useChartAnnotations('w', 'day'));

  expect(mocks.query).toHaveBeenCalledWith(
    'w',
    { startAt: 1000, endAt: 2000, pageSize: 1000 },
    { enabled: true },
  );
});

test('places markers at the start of the chart unit', () => {
  const { annotations } = renderHook(() => useChartAnnotations('w', 'month')).result.current;

  expect(annotations.map(({ id, markerDate }) => [id, markerDate])).toEqual([
    ['a', new Date(2026, 2, 1)],
    ['b', new Date(2026, 2, 1)],
  ]);
  expect(annotations.every(({ isGroupClickable }) => isGroupClickable)).toBe(true);
});

test('hides all-day annotations on hourly charts', () => {
  const { annotations } = renderHook(() => useChartAnnotations('w', 'hour')).result.current;

  expect(annotations.map(({ id }) => id)).toEqual(['b']);
  expect(annotations[0].isClickable).toBe(false);
});

test('is off without a website', () => {
  // Shared charts also render on boards, which keep plain charts.
  mocks.query.mockReturnValue({ data: undefined });
  const { annotations } = renderHook(() => useChartAnnotations(undefined, 'day')).result.current;

  expect(mocks.query.mock.lastCall[2]).toEqual({ enabled: false });
  expect(annotations).toEqual([]);
});

test('clicking a marker zooms into its day', () => {
  const { annotations, onAnnotationClick } = renderHook(() => useChartAnnotations('w', 'day'))
    .result.current;

  onAnnotationClick([annotations[0]]);

  const start = new Date(2026, 2, 10).getTime();
  const end = new Date(2026, 2, 10, 23, 59, 59, 999).getTime();

  expect(mocks.push).toHaveBeenCalledWith({ date: `range:${start}:${end}`, offset: undefined });
});
