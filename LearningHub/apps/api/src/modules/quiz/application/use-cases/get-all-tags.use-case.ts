import { Inject, Injectable } from '@nestjs/common';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../domain/repositories/tag.repository.interface';

@Injectable()
export class GetAllTagsUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  execute() {
    return this.tagRepository.findAll();
  }
}
