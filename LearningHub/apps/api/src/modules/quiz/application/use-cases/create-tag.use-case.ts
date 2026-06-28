import { Inject, Injectable } from '@nestjs/common';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../domain/repositories/tag.repository.interface';

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  execute(name: string, description?: string) {
    return this.tagRepository.create(name, description);
  }
}
