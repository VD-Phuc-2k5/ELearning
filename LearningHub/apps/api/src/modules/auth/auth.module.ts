import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./infrastructure/persistence/entities/user.entity";
import { RefreshTokenEntity } from "./infrastructure/persistence/entities/refresh-token.entity";
import { UserRepository } from "./infrastructure/persistence/repositories/user.repository";
import { RefreshTokenRepository } from "./infrastructure/persistence/repositories/refresh-token.repository";
import { PasswordService } from "./infrastructure/services/password.service";
import { HashService } from "./infrastructure/services/hash.service";
import { TokenService } from "./infrastructure/services/token.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { AuthController } from "./presentation/controllers/auth.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        // Repositories
        { provide: 'IUserRepository', useClass: UserRepository },
        { provide: 'IRefreshTokenRepository', useClass: RefreshTokenRepository },
        // Services
        { provide: 'IPasswordService', useClass: PasswordService },
        { provide: 'IHashService', useClass: HashService },
        { provide: 'ITokenService', useClass: TokenService },
        // Use Cases
        RegisterUseCase,
        LoginUseCase,
        RefreshTokenUseCase,
        LogoutUseCase,
    ],
})
export class AuthModule { }