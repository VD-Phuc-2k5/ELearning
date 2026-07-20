import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IResourceRegistryService } from '../../application/interfaces/i-resource-registry.service';

@Injectable()
export class ResourceRegistryService
  implements OnModuleInit, IResourceRegistryService
{
  private resources = new Set<string>();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    const tableNames = this.dataSource.entityMetadatas.map((m) => m.tableName);
    const urlResources = ['me', 'posts', 'reports', 'invites'];
    this.resources = new Set([...tableNames, ...urlResources]);
  }

  hasResource(resource: string): boolean {
    return this.resources.has(resource);
  }

  getResources(): string[] {
    return [...this.resources];
  }
}
