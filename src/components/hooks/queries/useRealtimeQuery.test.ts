import { renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { REALTIME_INTERVAL } from '@/lib/constants';
import { useRealtimeQuery } from './useRealtimeQuery';

const mocks = vi.hoisted(() => ({ get: vi.fn(), query: vi.fn((options: any) => options) }));
vi.mock('../useApi', () => ({ useApi: () => ({ get: mocks.get, useQuery: mocks.query }) }));

test('polls while live', () => {
  renderHook(() => useRealtimeQuery('w'));

  expect(mocks.query.mock.lastCall[0].refetchInterval).toBe(REALTIME_INTERVAL);
});

test('stops polling while paused', () => {
  renderHook(() => useRealtimeQuery('w', { paused: true }));

  expect(mocks.query.mock.lastCall[0].refetchInterval).toBe(false);
});
