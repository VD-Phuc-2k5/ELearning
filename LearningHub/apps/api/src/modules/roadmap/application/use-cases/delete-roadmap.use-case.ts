import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IRoadmapRepository,
  ROADMAP_REPOSITORY,
} from '../../domain/repositories/roadmap.repository.interface';

@Injectable()
export class DeleteRoadmapUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const roadmap = await this.roadmapRepo.findById(id);
    if (!roadmap) throw new NotFoundException(`Roadmap ${id} not found`);
    if (roadmap.creatorId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa roadmap này');
    await this.roadmapRepo.delete(id);
  }
}
