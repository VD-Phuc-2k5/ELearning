export type ReactionTargetType = 'post' | 'comment';

export interface ForumReactionDomain {
  id: string;
  targetType: ReactionTargetType;
  targetId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}
