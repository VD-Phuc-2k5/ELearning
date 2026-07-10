export type ForumInviteStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'closed';

export interface ForumInviteDomain {
  id: string;
  forumId: string;
  inviterId: string | null;
  inviteeId: string | null;
  token: string;
  status: ForumInviteStatus;
  expiresAt: Date;
  acceptedCount: number;
}
