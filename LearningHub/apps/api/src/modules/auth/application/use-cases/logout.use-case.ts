import { Inject, Injectable } from "@nestjs/common";
import { Either, Failure, Usecase, left, right } from "@learning-hub/core"
import { IRefreshTokenRepository } from "../../domain/repositories/i-refresh-token.repository";
import { AuthFailures } from "../../domain/errors/auth.failures";
import { LogoutDto } from "../dto/logout.dto";
import { IHashService } from "../interfaces/i-hash.service";

export interface LogoutParams extends LogoutDto { }

@Injectable()
export class LogoutUseCase implements Usecase<void, LogoutParams> {
    constructor(
        @Inject('IRefreshTokenRepository')
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        @Inject('IHashService')
        private readonly hashService: IHashService
    ) { }

    async execute(params: LogoutParams): Promise<Either<Failure, void>> {
        const tokenHash = this.hashService.hash(params.refreshToken);
        const refreshToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (!refreshToken || refreshToken.revokedAt !== null) {
            return left(AuthFailures.invalidRefreshToken());
        }
        await this.refreshTokenRepository.revoke(refreshToken);
        return right(undefined);
    }
}