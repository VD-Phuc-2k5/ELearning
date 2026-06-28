import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface DeleteAdminParams {
  id: string;
}

export class DeleteAdminUsecase implements Usecase<void, DeleteAdminParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: DeleteAdminParams): Promise<Either<Failure, void>> {
    return this.repository.deleteUser(params.id);
  }
}
