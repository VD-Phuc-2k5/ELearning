export const ALLOWED_EMOJIS = [
  '👍',
  '👎',
  '❤️',
  '🎉',
  '🔥',
  '💯',
  '👀',
  '😮',
  '😢',
  '😡',
  '🤔',
  '🙌',
  '👍🏻',
  '👏',
  '🚀',
  '💡',
  '✅',
  '❌',
  '☕',
  '🤝',
] as const;

export type AllowedEmoji = (typeof ALLOWED_EMOJIS)[number];

export function isAllowedEmoji(value: string): value is AllowedEmoji {
  return (ALLOWED_EMOJIS as readonly string[]).includes(value);
}
