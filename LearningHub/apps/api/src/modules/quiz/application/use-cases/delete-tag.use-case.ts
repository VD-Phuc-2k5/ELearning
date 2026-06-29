import { Inject, Injectable } from '@nestjs/common';
import {
  ITagRepository,
  TAG_REPOSITORY,
} from '../../domain/repositories/tag.repository.interface';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
  ) {}

  execute(id: number) {
    return this.tagRepository.delete(id);
  }
}
