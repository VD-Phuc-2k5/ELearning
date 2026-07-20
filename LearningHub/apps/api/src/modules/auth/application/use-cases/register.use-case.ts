import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { RegisterDto } from '../dto/register.dto';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { IRoleRepository } from '../../domain/repositories/i-role.repository';
import { IUserRoleRepository } from '../../domain/repositories/i-user-role.repository';
import { User } from '../../domain/entities/user.entity';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { IPasswordService } from '../interfaces/i-password.service';

export type RegisterParams = RegisterDto;

export interface RegisterResult {
  user: User;
}

@Injectable()
export class RegisterUseCase
  implements Usecase<RegisterResult, RegisterParams>
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

  async execute(params: RegisterDto): Promise<Either<Failure, RegisterResult>> {
    const { email, password, username } = params;
    const user = await this.userRepository.findByEmail(email);
    if (user) {
      return left(AuthFailures.userAlreadyExists());
    }
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      return left(AuthFailures.usernameAlreadyExists());
    }
    const hashedPassword = await this.passwordService.hash(password);
    const newUser = new User(
      crypto.randomUUID(),
      email,
      hashedPassword,
      username,
      '',
      true,
      new Date(),
      new Date(),
      null,
    );
    const savedUser = await this.userRepository.create(newUser);

    // ponytail: auto-assign STUDENT role as default system config; skip silently if role missing
    const studentRole = await this.roleRepository.findByCode('STUDENT');
    if (studentRole) {
      await this.userRoleRepository.assign(
        savedUser.id,
        studentRole.id,
        savedUser.id,
      );
    }

    return right({ user: savedUser });
  }
}
