import { Inject, Injectable } from "@nestjs/common";
import { Either, Failure, Usecase, left, right } from "@learning-hub/core";
import { ITokenService } from "../interfaces/i-token.service";
import { IPasswordService } from "../interfaces/i-password.service";
import { IUserRepository } from "../../domain/repositories/i-user.repository";
import { IRefreshTokenRepository } from "../../domain/repositories/i-refresh-token.repository";
import { AuthFailures } from "../../domain/errors/auth.failures";
import { LoginDto } from "../dto/login.dto";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { IHashService } from "../interfaces/i-hash.service";

export interface LoginParams extends LoginDto { }

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class LoginUseCase implements Usecase<LoginResult, LoginParams> {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        @Inject('IPasswordService')
        private readonly passwordService: IPasswordService,
        @Inject('IHashService')
        private readonly hashService: IHashService,
        @Inject('ITokenService')
        private readonly tokenService: ITokenService,
    ) { }

    async execute(params: LoginParams): Promise<Either<Failure, LoginResult>> {
        const user = await this.userRepository.findByEmail(params.email);
        if (!user) {
            return left(AuthFailures.userNotFound());
        }
        const isPasswordValid = await this.passwordService.compare(params.password, user.getPassword());
        if (!isPasswordValid) {
            return left(AuthFailures.invalidPassword());
        }
        const accessToken = this.tokenService.generateAccessToken(user);
        const refreshToken = this.tokenService.generateRefreshToken();
        const tokenHash = this.hashService.hash(refreshToken);
        const newRefreshToken = new RefreshToken(
            crypto.randomUUID(),
            tokenHash,
            user.id,
            new Date(),
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            null,
        )
        await this.refreshTokenRepository.save(newRefreshToken);
        return right({ accessToken, refreshToken });
    }
}