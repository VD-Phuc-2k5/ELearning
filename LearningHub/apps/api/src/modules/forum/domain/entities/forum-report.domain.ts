export type ReportTargetType = 'forum' | 'post' | 'comment';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface ForumReportDomain {
  id: string;
  reporterId: string;
  reporterName?: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  resolvedBy: string | null;
  resolutionNote: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminReportDetail extends ForumReportDomain {
  reporterName: string;
  postTitle: string | null;
  postContent: Record<string, unknown> | null;
  postStatus: string | null;
  forumId: string | null;
  forumSlug: string | null;
  forumName: string | null;
}
