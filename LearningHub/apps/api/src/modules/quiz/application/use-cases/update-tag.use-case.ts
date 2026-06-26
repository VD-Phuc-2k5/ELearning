import { Inject, Injectable } from '@nestjs/common';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../domain/repositories/tag.repository.interface';

@Injectable()
export class UpdateTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  execute(id: number, name?: string, description?: string) {
    return this.tagRepository.update(id, name, description);
  }
}
