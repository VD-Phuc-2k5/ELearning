import { BankTagEntity } from '../entities/bank-tag.domain';

export interface ITagRepository {
  findAll(): Promise<BankTagEntity[]>;
  findByIds(ids: number[]): Promise<BankTagEntity[]>;
  create(name: string, description?: string): Promise<BankTagEntity>;
  update(id: number, name?: string, description?: string): Promise<BankTagEntity>;
  delete(id: number): Promise<void>;
}

export const TAG_REPOSITORY = Symbol('ITagRepository');
