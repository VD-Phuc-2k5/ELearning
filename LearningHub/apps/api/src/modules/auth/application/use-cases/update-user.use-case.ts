import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { IPasswordService } from '../interfaces/i-password.service';
import { User } from '../../domain/entities/user.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { UpdateUserDto } from '../dto/user.dto';

export interface UpdateUserParams extends UpdateUserDto {
  id: string;
}

export interface UpdateUserResult {
  user: User;
}

@Injectable()
export class UpdateUserUseCase
  implements Usecase<UpdateUserResult, UpdateUserParams>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(
    params: UpdateUserParams,
  ): Promise<Either<Failure, UpdateUserResult>> {
    const user = await this.userRepository.findById(params.id);
    if (!user) return left(AuthFailures.userNotFound());

    if (params.email !== undefined && params.email !== user.email) {
      const existing = await this.userRepository.findByEmail(params.email);
      if (existing && existing.id !== user.id)
        return left(AuthFailures.emailAlreadyInUse());
      user.email = params.email;
    }
    if (params.username !== undefined) user.username = params.username;
    if (params.isActive !== undefined) user.isActive = params.isActive;
    if (params.password !== undefined) {
      user['password'] = await this.passwordService.hash(params.password);
    }
    user.updatedAt = new Date();

    const updated = await this.userRepository.update(user);
    return right({ user: updated });
  }
}
