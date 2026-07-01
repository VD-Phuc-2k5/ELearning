export type ForumVisibility = 'public' | 'private' | 'hidden';
export type ForumMemberRole = 'owner' | 'moderator' | 'member';

export interface ForumDomain {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: ForumVisibility;
  bannerUrl: string | null;
  iconUrl: string | null;
  memberCount: number;
  postCount: number;
  ownerId: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
