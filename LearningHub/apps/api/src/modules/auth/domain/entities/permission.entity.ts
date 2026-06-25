export class Permission {
  constructor(
    public readonly id: number,
    public code: string,
    public name: string,
    public description: string,
    public resource: string,
    public action: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
