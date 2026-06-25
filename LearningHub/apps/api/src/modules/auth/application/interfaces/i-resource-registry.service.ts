export interface IResourceRegistryService {
  hasResource(resource: string): boolean;
  getResources(): string[];
}
