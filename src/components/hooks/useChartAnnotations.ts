import { isSameDay } from 'date-fns';
import { useCallback, useMemo } from 'react';
import type { ChartAnnotation } from '@/components/charts/ChartAnnotationMarkers';
import { getAnnotationDateRangeValue } from '@/lib/annotations';
import { DATE_FUNCTIONS } from '@/lib/date';
import { useWebsiteAnnotationsQuery } from './queries/useWebsiteAnnotationsQuery';
import { useDateParameters } from './useDateParameters';
import { useDateRange } from './useDateRange';
import { useNavigation } from './useNavigation';
import { useTimezone } from './useTimezone';

/** Loads a website's annotations for the global date range as markers for a chart in `unit`. */
export function useChartAnnotations(websiteId: string | undefined, unit: string) {
  const { timezone, fromUtc } = useTimezone();
  const { dateRange } = useDateRange({ timezone });
  const { startDate, endDate } = dateRange;
  const { startAt, endAt } = useDateParameters();
  const { router, updateParams } = useNavigation();
  const { data } = useWebsiteAnnotationsQuery(
    websiteId,
    { startAt, endAt, pageSize: 1000 },
    { enabled: !!websiteId },
  );
  const canDrillIntoAnnotation =
    unit !== 'hour' && unit !== 'minute' && !isSameDay(startDate, endDate);

  const annotations = useMemo<ChartAnnotation[]>(() => {
    if (!websiteId) {
      return [];
    }

    const isSubDayUnit = unit === 'hour' || unit === 'minute';

    return (data?.data || [])
      .filter(({ allDay }) => !isSubDayUnit || allDay === false)
      .map(({ id, date, note, allDay }) => {
        const annotationDate = fromUtc(new Date(date));

        return {
          id,
          date: annotationDate,
          markerDate: DATE_FUNCTIONS[unit].start(annotationDate),
          label: note,
          allDay,
          isClickable: canDrillIntoAnnotation,
          isGroupClickable: unit === 'month',
        };
      });
  }, [websiteId, data, timezone, unit, canDrillIntoAnnotation]);

  const onAnnotationClick = useCallback(
    (annotations: ChartAnnotation[]) => {
      const [annotation] = annotations;
      const hasOneDate = annotations.every(item => isSameDay(item.date, annotation.date));

      if (hasOneDate) {
        router.push(
          updateParams({
            date: getAnnotationDateRangeValue(annotation.date, annotation.allDay !== false),
            offset: undefined,
          }),
        );
        return;
      }

      const markerDate = annotation.markerDate || annotation.date;
      const startDate = DATE_FUNCTIONS.month.start(markerDate);
      const endDate = DATE_FUNCTIONS.month.end(markerDate);

      router.push(
        updateParams({
          date: `range:${startDate.getTime()}:${endDate.getTime()}`,
          offset: undefined,
        }),
      );
    },
    [router, updateParams],
  );

  return { annotations, onAnnotationClick };
}
