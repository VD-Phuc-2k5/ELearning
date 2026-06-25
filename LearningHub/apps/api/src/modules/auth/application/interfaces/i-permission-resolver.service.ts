export interface IPermissionResolverService {
  getEffectivePermissions(userId: string): Promise<Set<string>>;
  invalidate(userId: string): void;
}
