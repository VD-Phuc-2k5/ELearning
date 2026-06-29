export type ReportTargetType = 'forum' | 'post' | 'comment';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface ForumReportDomain {
  id: string;
  reporterId: string;
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

export interface ForumModerationLogDomain {
  id: string;
  moderatorId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  reasonCode: string | null;
  reasonText: string | null;
  forumId: string | null;
  createdAt: Date;
}
