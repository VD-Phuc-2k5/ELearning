import { Inject, Injectable } from '@nestjs/common';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../domain/repositories/tag.repository.interface';

@Injectable()
export class ManageTagsUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  getAll() {
    return this.tagRepository.findAll();
  }

  create(name: string, description?: string) {
    return this.tagRepository.create(name, description);
  }

  update(id: number, name?: string, description?: string) {
    return this.tagRepository.update(id, name, description);
  }

  delete(id: number) {
    return this.tagRepository.delete(id);
  }
}
