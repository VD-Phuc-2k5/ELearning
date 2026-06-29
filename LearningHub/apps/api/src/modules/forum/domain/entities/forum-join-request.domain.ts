export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ForumJoinRequestDomain {
  id: string;
  forumId: string;
  userId: string;
  status: JoinRequestStatus;
  message: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
