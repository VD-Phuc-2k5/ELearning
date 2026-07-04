import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { IPasswordService } from '../interfaces/i-password.service';
import { User } from '../../domain/entities/user.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { RegisterDto } from '../dto/register.dto';

export interface AdminRegisterParams extends RegisterDto {
  createdBy: string;
}

export interface AdminRegisterResult {
  user: User;
}

@Injectable()
export class AdminRegisterUseCase
  implements Usecase<AdminRegisterResult, AdminRegisterParams>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(
    params: AdminRegisterParams,
  ): Promise<Either<Failure, AdminRegisterResult>> {
    const existing = await this.userRepository.findByEmail(params.email);
    if (existing) return left(AuthFailures.userAlreadyExists());

    const existingUsername = await this.userRepository.findByUsername(
      params.username,
    );
    if (existingUsername) return left(AuthFailures.usernameAlreadyExists());

    const hashedPassword = await this.passwordService.hash(params.password);
    const newUser = new User(
      crypto.randomUUID(),
      params.email,
      hashedPassword,
      params.username,
      '',
      true,
      new Date(),
      new Date(),
      null,
    );
    const savedUser = await this.userRepository.create(newUser);

    const adminRole = await this.roleRepository.findByCode('ADMIN');
    if (!adminRole) return left(AuthFailures.roleNotFound());

    await this.userRoleRepository.assign(
      savedUser.id,
      adminRole.id,
      params.createdBy,
    );

    return right({ user: savedUser });
  }
}
