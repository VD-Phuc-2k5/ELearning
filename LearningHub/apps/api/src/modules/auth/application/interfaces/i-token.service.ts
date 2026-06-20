import { User } from "../../domain/entities/user.entity";

export interface ITokenService {
    generateAccessToken(user: User): string;
    generateRefreshToken(): string;
}