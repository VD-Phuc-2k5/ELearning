import type { ForumMemberRole } from './forum.domain';

export interface ForumMemberDomain {
  id: string;
  forumId: string;
  userId: string;
  role: ForumMemberRole;
  joinedAt: Date;
}
