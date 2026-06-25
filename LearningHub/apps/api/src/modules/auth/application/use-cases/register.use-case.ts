import { Inject, Injectable } from "@nestjs/common";
import { Either, Failure, Usecase, left, right } from "@learning-hub/core";
import { RegisterDto } from "../dto/register.dto";
import { IUserRepository } from "../../domain/repositories/i-user.repository";
import { User } from "../../domain/entities/user.entity";
import { AuthFailures } from "../../domain/errors/auth.failures";
import { IPasswordService } from "../interfaces/i-password.service";

export interface RegisterParams extends RegisterDto { }

export interface RegisterResult {
    user: User;
}

@Injectable()
export class RegisterUseCase implements Usecase<RegisterResult, RegisterParams> {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        @Inject('IPasswordService')
        private readonly passwordService: IPasswordService,
    ) { }

    async execute(params: RegisterDto): Promise<Either<Failure, RegisterResult>> {
        const { email, password, username } = params;
        const user = await this.userRepository.findByEmail(email);
        if (user) {
            return left(AuthFailures.userAlreadyExists());
        }
        const hashedPassword = await this.passwordService.hash(password);
        const isActive = true;
        const newUser = new User(
            crypto.randomUUID(),
            email,
            hashedPassword,
            username,
            '',
            isActive,
            new Date(),
            new Date(),
            null,
        );
        const savedUser = await this.userRepository.create(newUser);
        return right({ user: savedUser });
    }
}