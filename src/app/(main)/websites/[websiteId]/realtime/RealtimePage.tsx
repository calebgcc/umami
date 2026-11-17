'use client';
import { Grid } from '@umami/react-zen';
import { useState } from 'react';
import { firstBy } from 'thenby';
import { GridRow } from '@/components/common/GridRow';
import { PageBody } from '@/components/common/PageBody';
import { Panel } from '@/components/common/Panel';
import { useMobile, useRealtimeQuery } from '@/components/hooks';
import { RealtimeChart } from '@/components/metrics/RealtimeChart';
import { WorldMap } from '@/components/metrics/WorldMap';
import { percentFilter } from '@/lib/filters';
import { RealtimeCountries } from './RealtimeCountries';
import { RealtimeHeader } from './RealtimeHeader';
import { RealtimeLog } from './RealtimeLog';
import { RealtimePaths } from './RealtimePaths';
import { RealtimePauseButton } from './RealtimePauseButton';
import { RealtimeReferrers } from './RealtimeReferrers';

export function RealtimePage({ websiteId }: { websiteId: string }) {
  const [isPaused, setIsPaused] = useState(false);
  const { data, isLoading, error } = useRealtimeQuery(websiteId, { paused: isPaused });
  const { isMobile } = useMobile();

  if (isLoading || error) {
    return <PageBody isLoading={isLoading} error={error} />;
  }

  const countries = percentFilter(
    Object.keys(data.countries)
      .map(key => ({ x: key, y: data.countries[key] }))
      .sort(firstBy('y', -1)),
  );

  return (
    <Grid gap="3">
      <RealtimePauseButton isPaused={isPaused} onChange={setIsPaused} />
      <RealtimeHeader data={data} />
      <Panel>
        <RealtimeChart data={data} unit="minute" />
      </Panel>
      <Panel>
        <RealtimeLog data={data} />
      </Panel>
      <GridRow layout="two">
        <Panel>
          <RealtimePaths data={data} />
        </Panel>
        <Panel>
          <RealtimeReferrers data={data} />
        </Panel>
      </GridRow>
      <GridRow layout="one-two">
        <Panel>
          <RealtimeCountries data={countries} />
        </Panel>
        <Panel gridColumn={isMobile ? null : 'span 2'} padding="0">
          <WorldMap data={countries} />
        </Panel>
      </GridRow>
    </Grid>
  );
}
