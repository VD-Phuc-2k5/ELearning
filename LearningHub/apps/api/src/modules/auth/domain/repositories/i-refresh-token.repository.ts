import { RefreshToken } from "../entities/refresh-token.entity";

export interface IRefreshTokenRepository {
    save(token: RefreshToken): Promise<RefreshToken>;
    revoke(token: RefreshToken): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
}