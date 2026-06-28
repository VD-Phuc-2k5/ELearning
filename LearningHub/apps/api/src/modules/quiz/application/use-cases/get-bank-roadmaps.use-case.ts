import { Inject, Injectable } from '@nestjs/common';
import {
  BankRoadmapItem,
  IRoadmapItemRepository,
  ROADMAP_ITEM_REPOSITORY,
} from '../../../roadmap/domain/repositories/roadmap-item.repository.interface';

@Injectable()
export class GetBankRoadmapsUseCase {
  constructor(
    @Inject(ROADMAP_ITEM_REPOSITORY)
    private readonly roadmapItemRepository: IRoadmapItemRepository,
  ) {}

  async execute(bankId: string): Promise<BankRoadmapItem[]> {
    return this.roadmapItemRepository.findBankRoadmaps(bankId);
  }
}
