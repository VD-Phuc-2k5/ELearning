export const MODERATION_REASONS = [
  'SPAM',
  'INAPPROPRIATE_CONTENT',
  'HARASSMENT',
  'COPYRIGHT',
  'MISLEADING',
  'OTHER',
] as const;

export type ModerationReason = (typeof MODERATION_REASONS)[number];

export function isModerationReason(value: string): value is ModerationReason {
  return (MODERATION_REASONS as readonly string[]).includes(value);
}
