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
