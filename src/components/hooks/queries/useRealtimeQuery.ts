import { REALTIME_INTERVAL } from '@/lib/constants';
import type { RealtimeData } from '@/lib/types';
import { useApi } from '../useApi';

export function useRealtimeQuery(websiteId: string, { paused = false }: { paused?: boolean } = {}) {
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery<RealtimeData>({
    queryKey: ['realtime', { websiteId }],
    queryFn: async () => {
      return get(`/realtime/${websiteId}`);
    },
    enabled: !!websiteId,
    // A paused view keeps showing its last data instead of polling.
    refetchInterval: paused ? false : REALTIME_INTERVAL,
  });

  return { data, isLoading, error };
}
