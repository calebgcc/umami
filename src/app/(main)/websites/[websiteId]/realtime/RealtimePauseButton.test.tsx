import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { RealtimePauseButton } from './RealtimePauseButton';

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: { pause: 'Pause', paused: 'Paused', realtime: 'Realtime', resume: 'Resume' },
  }),
}));

test('pauses a live view', async () => {
  const onChange = vi.fn();
  const { user } = render(<RealtimePauseButton isPaused={false} onChange={onChange} />);

  expect(screen.getByText('Realtime')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Pause' }));

  expect(onChange).toHaveBeenCalledWith(true);
});

test('resumes a paused view', async () => {
  const onChange = vi.fn();
  const { user } = render(<RealtimePauseButton isPaused={true} onChange={onChange} />);

  expect(screen.getByText('Paused')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Resume' }));

  expect(onChange).toHaveBeenCalledWith(false);
});
