import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetUserPermissionsUsecase implements Usecase<any[], any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, any[]>> {
    return this.repository.getUserPermissions(params.userId)
  }
}
