import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RefreshTokenEntity } from "../entities/refresh-token.entity";
import { RefreshToken } from "../../../domain/entities/refresh-token.entity";
import { IRefreshTokenRepository } from "../../../domain/repositories/i-refresh-token.repository";

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshTokenEntity)
        private readonly repository: Repository<RefreshTokenEntity>,
    ) { }

    async save(refreshToken: RefreshToken): Promise<RefreshToken> {
        const entity = await this.repository.save(this.fromDomain(refreshToken));
        return this.toDomain(entity);
    }

    async revoke(token: RefreshToken): Promise<void> {
        await this.repository.update(token.id, { revokedAt: new Date() });
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const entity = await this.repository.findOne({ where: { tokenHash } });
        return entity ? this.toDomain(entity) : null;
    }

    private toDomain(entity: RefreshTokenEntity): RefreshToken {
        return new RefreshToken(
            entity.id,
            entity.tokenHash,
            entity.userId,
            entity.createdAt,
            entity.expiresAt,
            entity.revokedAt,
        );
    }

    private fromDomain(refreshToken: RefreshToken): RefreshTokenEntity {
        return {
            id: refreshToken.id,
            tokenHash: refreshToken.tokenHash,
            userId: refreshToken.userId,
            createdAt: refreshToken.createdAt,
            expiresAt: refreshToken.expiresAt,
            revokedAt: refreshToken.revokedAt,
        }
    }
}