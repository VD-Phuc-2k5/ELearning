export type ForumInviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface ForumInviteDomain {
  id: string;
  forumId: string;
  inviterId: string;
  inviteeId: string | null;
  token: string;
  status: ForumInviteStatus;
  expiresAt: Date;
}
