import { Either, Failure, Usecase } from '@learning-hub/core';
import { MemberSuggestion, SearchMembersParams } from '../entities/entities';
import { IForumRepository } from '../repositories/IForumRepository';

export class SearchMembersUsecase
  implements Usecase<MemberSuggestion[], SearchMembersParams>
{
  constructor(private repository: IForumRepository) {}
  async execute(
    params: SearchMembersParams,
  ): Promise<Either<Failure, MemberSuggestion[]>> {
    return this.repository.searchMembers(params);
  }
}
