import { Button, Icon, Row, StatusLight, Text } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { Pause, Play } from '@/components/icons';

export function RealtimePauseButton({
  isPaused,
  onChange,
}: {
  isPaused: boolean;
  onChange: (isPaused: boolean) => void;
}) {
  const { t, labels } = useMessages();

  return (
    <Row alignItems="center" justifyContent="flex-end" gap="3">
      <StatusLight variant={isPaused ? 'warning' : 'success'}>
        <Text size="sm" weight="medium">
          {t(isPaused ? labels.paused : labels.realtime)}
        </Text>
      </StatusLight>
      <Button
        variant="quiet"
        onPress={() => onChange(!isPaused)}
        aria-pressed={isPaused}
        data-testid="realtime-pause-button"
      >
        <Icon>{isPaused ? <Play /> : <Pause />}</Icon>
        <Text>{t(isPaused ? labels.resume : labels.pause)}</Text>
      </Button>
    </Row>
  );
}
