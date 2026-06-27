export interface Roadmap {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly creatorId: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
