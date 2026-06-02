import { BadRequestException } from '@nestjs/common';

export const MAX_APPLICATION_DEADLINE_DAYS = 60;

export function assertValidApplicationDeadline(iso?: string | null) {
  if (!iso?.trim()) return;

  const deadline = new Date(iso);
  if (Number.isNaN(deadline.getTime())) {
    throw new BadRequestException('Application deadline is invalid.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const max = new Date(today);
  max.setDate(max.getDate() + MAX_APPLICATION_DEADLINE_DAYS);

  if (deadline < today) {
    throw new BadRequestException('Application deadline cannot be in the past.');
  }

  if (deadline > max) {
    throw new BadRequestException(
      `Application deadline cannot be more than ${MAX_APPLICATION_DEADLINE_DAYS} days from today.`,
    );
  }
}
