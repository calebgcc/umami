import { type ReactNode, useCallback, useMemo } from 'react';
import type { ChartAnnotation } from '@/components/charts/ChartAnnotationMarkers';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useBarDrillDown,
  useChartAnnotations,
  useDateRange,
  useTimezone,
} from '@/components/hooks';
import { useWebsitePageviewsQuery } from '@/components/hooks/queries/useWebsitePageviewsQuery';
import { PageviewsChart } from '@/components/metrics/PageviewsChart';
import type { AnnotationRange } from '@/lib/annotations';
import { alignCompareSeries, DATE_FUNCTIONS, minDate } from '@/lib/date';

export function WebsiteChart({
  websiteId,
  compareMode,
  showAnnotations,
  allowBarDrill,
  onAnnotationMoreClick,
  legendActions,
}: {
  websiteId: string;
  compareMode?: boolean;
  showAnnotations?: boolean;
  allowBarDrill?: boolean;
  onAnnotationMoreClick?: (range: AnnotationRange) => void;
  legendActions?: ReactNode;
}) {
  const { timezone, fromUtc, toUtc } = useTimezone();
  const { dateRange, dateCompare } = useDateRange({ timezone: timezone });
  const { startDate, endDate, unit, value } = dateRange;
  const { annotations, onAnnotationClick } = useChartAnnotations(
    showAnnotations ? websiteId : undefined,
    unit,
  );
  const { data, isLoading, isFetching, error } = useWebsitePageviewsQuery({
    websiteId,
    compare: compareMode ? dateCompare?.compare : undefined,
  });
  const { pageviews, sessions, compare } = (data || {}) as any;

  const chartData = useMemo(() => {
    if (!data) {
      return { pageviews: [], sessions: [] };
    }

    // The comparison stops at the current bucket; later buckets have nothing to compare against.
    const compareEndDate = minDate(fromUtc(new Date()), endDate);

    return {
      pageviews,
      sessions,
      ...(compare && {
        compare: {
          pageviews: alignCompareSeries(
            compare.pageviews,
            fromUtc(compare.startDate),
            startDate,
            compareEndDate,
            unit,
          ),
          sessions: alignCompareSeries(
            compare.sessions,
            fromUtc(compare.startDate),
            startDate,
            compareEndDate,
            unit,
          ),
        },
      }),
    };
  }, [data, startDate, endDate, unit, timezone]);

  const handleBarClick = useBarDrillDown(unit, allowBarDrill);

  const handleAnnotationMoreClick = useCallback(
    (annotations: ChartAnnotation[]) => {
      const markerDate = annotations[0].markerDate || annotations[0].date;
      const { start, end } = DATE_FUNCTIONS[unit];

      onAnnotationMoreClick?.({
        startAt: +toUtc(start(markerDate)),
        endAt: +toUtc(end(markerDate)),
      });
    },
    [toUtc, onAnnotationMoreClick, unit],
  );

  return (
    <LoadingPanel data={data} isFetching={isFetching} isLoading={isLoading} error={error}>
      <PageviewsChart
        key={value}
        data={chartData}
        legendActions={legendActions}
        minDate={startDate}
        maxDate={endDate}
        unit={unit}
        annotations={annotations}
        onAnnotationClick={onAnnotationClick}
        onAnnotationMoreClick={onAnnotationMoreClick ? handleAnnotationMoreClick : undefined}
        onBarClick={handleBarClick}
      />
    </LoadingPanel>
  );
}
