import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IRoadmapRepository,
  ROADMAP_REPOSITORY,
  UpdateRoadmapInput,
} from '../../domain/repositories/roadmap.repository.interface';
import { RoadmapDomain } from '../../domain/entities/roadmap.domain';

@Injectable()
export class UpdateRoadmapUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateRoadmapInput,
    userId: string,
  ): Promise<RoadmapDomain> {
    const roadmap = await this.roadmapRepo.findById(id);
    if (!roadmap) throw new NotFoundException(`Roadmap ${id} not found`);
    if (roadmap.creatorId !== userId)
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa roadmap này');
    return this.roadmapRepo.update(id, dto);
  }
}
